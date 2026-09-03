"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

/**
 * Public view of the Minibits watchdog.
 *
 * Everything here comes from /api/watchdog, which reads the watchdog on a
 * private network and returns only these figures — the browser never learns the
 * API's address and never reaches it.
 */

/* Series colours. The brand blue, and an orange darkened from the brand's
   #f18805 so a 2px line clears 3:1 against the white card. Both were validated
   for lightness, chroma and colourblind separation against this surface. */
const RESERVES_COLOR = "#3680FA";
const ECASH_COLOR = "#D97706";
const SURFACE = "#ffffff";

const GITHUB_URL = "https://github.com/minibits-cash/minibits_watchdog";

type Point = { t: number; r: number | null; e: number | null };

type RangeData = {
  deltaReserves: number | null;
  deltaEcashIssued: number | null;
  samples: number;
  from: number | null;
  to: number | null;
  maxGapMs: number | null;
  points: Point[];
};

type RangeKey = "6h" | "24h" | "7d";

type WatchdogData = {
  ok: true;
  stale: boolean;
  updatedAt: string | null;
  unit: string;
  reserves: number | null;
  ecashIssued: number | null;
  ranges: Record<RangeKey, RangeData>;
};

const RANGES: { key: RangeKey; label: string; long: string }[] = [
  { key: "6h", label: "6h", long: "the past 6 hours" },
  { key: "24h", label: "24h", long: "the past 24 hours" },
  { key: "7d", label: "7d", long: "the past 7 days" },
];

/* ---------------------------------------------------------------- formatting */

const fmtSat = (v: number | null | undefined) =>
  v === null || v === undefined ? "—" : v.toLocaleString("en-US");

/** Signed, because on a change the sign is the point. */
function fmtSigned(v: number | null | undefined): string {
  if (v === null || v === undefined) return "—";
  const sign = v > 0 ? "+" : v < 0 ? "−" : "";
  return `${sign}${Math.abs(v).toLocaleString("en-US")}`;
}

/** Axis ticks only — never the figures themselves, which stay exact. */
function compact(v: number): string {
  const a = Math.abs(v);
  if (a >= 1_000_000) return `${(v / 1_000_000).toFixed(a >= 10_000_000 ? 0 : 1)}M`;
  if (a >= 1_000) return `${Math.round(v / 1_000)}k`;
  return String(Math.round(v));
}

function formatAge(iso: string | null, now: number): string {
  if (!iso) return "never";
  const ms = now - new Date(iso).getTime();
  if (ms < 60_000) return "just now";
  const m = Math.floor(ms / 60_000);
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const timeLabel = (t: number, range: RangeKey) =>
  range === "7d"
    ? new Date(t).toLocaleDateString(undefined, { month: "short", day: "numeric" })
    : new Date(t).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });

const fullLabel = (t: number) =>
  new Date(t).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

/* -------------------------------------------------------------------- chart */

const PAD = { top: 16, right: 18, bottom: 28, left: 60 };
/** Includes the x-axis band, so tick labels are never cropped into a scrollbar. */
const CHART_HEIGHT = 300;
const TOOLTIP_WIDTH = 190;

/** Ticks on round numbers, so the axis carries the values nothing labels. */
function niceTicks(min: number, max: number, count: number): number[] {
  if (!Number.isFinite(min) || !Number.isFinite(max)) return [];
  if (max === min) {
    const pad = Math.max(1, Math.abs(max) * 0.01);
    min -= pad;
    max += pad;
  }
  const rawStep = (max - min) / count;
  const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
  const normalised = rawStep / magnitude;
  const step = (normalised <= 1 ? 1 : normalised <= 2 ? 2 : normalised <= 5 ? 5 : 10) * magnitude;
  // Rounded outwards on both ends, so the domain the ticks define always
  // contains the data — a top tick below the maximum clips the line.
  const first = Math.floor(min / step) * step;
  const last = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let v = first; v <= last + step * 0.001; v += step) {
    ticks.push(Math.round(v));
  }
  return ticks;
}

function buildPath(
  points: Point[],
  key: "r" | "e",
  x: (t: number) => number,
  y: (v: number) => number
): string {
  let d = "";
  let drawing = false;
  for (const p of points) {
    const v = p[key];
    // A null is a collection gap: lift the pen rather than drawing a straight
    // line through hours nobody observed.
    if (v === null) {
      drawing = false;
      continue;
    }
    d += `${drawing ? "L" : "M"}${x(p.t).toFixed(1)} ${y(v).toFixed(1)}`;
    drawing = true;
  }
  return d;
}

function WatchdogChart({ points, range }: { points: Point[]; range: RangeKey }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [hover, setHover] = useState<number | null>(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    setWidth(el.clientWidth);
    const ro = new ResizeObserver((entries) => setWidth(entries[0].contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const geometry = useMemo(() => {
    const valued = points.filter((p) => p.r !== null && p.e !== null);
    if (valued.length === 0 || width <= 0) return null;

    const t0 = points[0].t;
    const t1 = points[points.length - 1].t;
    const values = valued.flatMap((p) => [p.r as number, p.e as number]);
    const dataMin = Math.min(...values);
    const dataMax = Math.max(...values);

    /* The axis follows the data instead of anchoring at zero: these are large,
       slow-moving balances, and against a zero baseline a day of movement is a
       few pixels and every line reads as flat. Zero is forced back in once the
       data comes near it — it is the solvency boundary, and cropping out the
       line being approached would be worse than a flat chart. */
    const nearZero = dataMin < Math.abs(dataMax) * 0.25;
    const ticks = niceTicks(nearZero ? 0 : dataMin, dataMax, 4);
    const y0 = ticks[0];
    const y1 = ticks[ticks.length - 1];

    const plotW = Math.max(1, width - PAD.left - PAD.right);
    const plotH = CHART_HEIGHT - PAD.top - PAD.bottom;
    const x = (t: number) => PAD.left + (t1 === t0 ? plotW / 2 : ((t - t0) / (t1 - t0)) * plotW);
    const y = (v: number) => PAD.top + (1 - (v - y0) / (y1 - y0 || 1)) * plotH;

    const xTickCount = width < 420 ? 3 : 4;
    const xTicks = Array.from({ length: xTickCount }, (_, i) =>
      Math.round(t0 + ((t1 - t0) * i) / (xTickCount - 1))
    );

    return { valued, t0, t1, ticks, y0, plotW, plotH, x, y, xTicks, includesZero: y0 <= 0 };
  }, [points, width]);

  const active = hover !== null && geometry ? geometry.valued[hover] : null;

  const onPointer = useCallback(
    (event: React.PointerEvent<SVGSVGElement>) => {
      if (!geometry) return;
      const rect = event.currentTarget.getBoundingClientRect();
      const px = event.clientX - rect.left;
      // Nearest point wins, so the reader aims at a time rather than at a line.
      let best = 0;
      let bestDistance = Infinity;
      geometry.valued.forEach((p, i) => {
        const distance = Math.abs(geometry.x(p.t) - px);
        if (distance < bestDistance) {
          bestDistance = distance;
          best = i;
        }
      });
      setHover(best);
    },
    [geometry]
  );

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (!geometry) return;
      const last = geometry.valued.length - 1;
      if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
        event.preventDefault();
        const step = event.key === "ArrowRight" ? 1 : -1;
        setHover((h) => Math.min(last, Math.max(0, (h === null ? last : h) + step)));
      } else if (event.key === "Escape") {
        setHover(null);
      }
    },
    [geometry]
  );

  if (points.length === 0) {
    return (
      <p className="py-16 text-center text-sm text-zinc-500">
        No observations recorded in this window yet.
      </p>
    );
  }

  const tooltipLeft =
    geometry && active
      ? Math.min(
          Math.max(geometry.x(active.t) - TOOLTIP_WIDTH / 2, 4),
          Math.max(4, width - TOOLTIP_WIDTH - 4)
        )
      : 0;

  return (
    <div
      ref={wrapRef}
      className="relative focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3680FA]/40"
      tabIndex={0}
      role="group"
      aria-label="Reserves and ecash issued over time. Use the left and right arrow keys to step through observations, or switch to the table view."
      onKeyDown={onKeyDown}
      onBlur={() => setHover(null)}
    >
      <svg
        width={Math.max(width, 1)}
        height={CHART_HEIGHT}
        onPointerMove={onPointer}
        onPointerLeave={() => setHover(null)}
        className="touch-pan-y"
      >
        {geometry && (
          <>
            {/* Hairline, solid, one step off the surface — a grid, not a threshold. */}
            {geometry.ticks.map((v) => (
              <g key={v}>
                <line
                  x1={PAD.left}
                  x2={PAD.left + geometry.plotW}
                  y1={geometry.y(v)}
                  y2={geometry.y(v)}
                  stroke="#e4e4e7"
                  strokeWidth={1}
                />
                <text
                  x={PAD.left - 10}
                  y={geometry.y(v)}
                  textAnchor="end"
                  dominantBaseline="middle"
                  className="fill-zinc-400 text-[11px] tabular-nums"
                >
                  {compact(v)}
                </text>
              </g>
            ))}

            {geometry.xTicks.map((t, i) => (
              <text
                key={t}
                x={geometry.x(t)}
                y={CHART_HEIGHT - 8}
                textAnchor={i === 0 ? "start" : i === geometry.xTicks.length - 1 ? "end" : "middle"}
                className="fill-zinc-400 text-[11px] tabular-nums"
              >
                {timeLabel(t, range)}
              </text>
            ))}

            {active && (
              <line
                x1={geometry.x(active.t)}
                x2={geometry.x(active.t)}
                y1={PAD.top}
                y2={PAD.top + geometry.plotH}
                stroke="#a1a1aa"
                strokeWidth={1}
              />
            )}

            <path
              d={buildPath(points, "r", geometry.x, geometry.y)}
              fill="none"
              stroke={RESERVES_COLOR}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d={buildPath(points, "e", geometry.x, geometry.y)}
              fill="none"
              stroke={ECASH_COLOR}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Markers carry a 2px ring in the surface colour so they stay
                legible where the two lines cross. */}
            {(active ? [active] : [geometry.valued[geometry.valued.length - 1]]).map((p) => (
              <g key={`marker-${p.t}`}>
                <circle
                  cx={geometry.x(p.t)}
                  cy={geometry.y(p.r as number)}
                  r={4}
                  fill={RESERVES_COLOR}
                  stroke={SURFACE}
                  strokeWidth={2}
                />
                <circle
                  cx={geometry.x(p.t)}
                  cy={geometry.y(p.e as number)}
                  r={4}
                  fill={ECASH_COLOR}
                  stroke={SURFACE}
                  strokeWidth={2}
                />
              </g>
            ))}
          </>
        )}
      </svg>

      {active && (
        <div
          className="pointer-events-none absolute top-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs shadow-lg"
          style={{ left: tooltipLeft, width: TOOLTIP_WIDTH }}
          role="status"
        >
          <div className="mb-1.5 text-zinc-500">{fullLabel(active.t)}</div>
          <TooltipRow color={RESERVES_COLOR} label="Reserves" value={active.r} />
          <TooltipRow color={ECASH_COLOR} label="Ecash issued" value={active.e} />
        </div>
      )}

      {geometry && !geometry.includesZero && (
        <p className="mt-2 text-xs text-zinc-400">
          Vertical axis starts at {compact(geometry.y0)} sat, not zero — these balances move by
          small fractions of their size.
        </p>
      )}
    </div>
  );
}

function TooltipRow({ color, label, value }: { color: string; label: string; value: number | null }) {
  return (
    <div className="flex items-center gap-2">
      {/* A line key, not a box: at tooltip density a filled swatch is ink doing a label's job. */}
      <span aria-hidden className="h-0.5 w-3 shrink-0 rounded-full" style={{ background: color }} />
      <span className="whitespace-nowrap text-zinc-500">{label}</span>
      <span className="ml-auto font-semibold tabular-nums text-zinc-900">{fmtSat(value)}</span>
    </div>
  );
}

/** The chart's WCAG-clean twin — every plotted value without hovering. */
function SeriesTable({ points }: { points: Point[] }) {
  return (
    <div className="max-h-[300px] overflow-auto">
      <table className="w-full text-xs tabular-nums">
        <thead className="sticky top-0 bg-white">
          <tr className="text-zinc-500">
            <th className="py-2 pr-3 text-left font-medium">Time</th>
            <th className="py-2 pl-3 text-right font-medium">Reserves</th>
            <th className="py-2 pl-3 text-right font-medium">Ecash issued</th>
          </tr>
        </thead>
        <tbody>
          {[...points].reverse().map((p) => (
            <tr key={p.t} className="border-t border-zinc-100">
              <td className="whitespace-nowrap py-1.5 pr-3 text-zinc-500">
                {p.r === null ? "— collection gap —" : fullLabel(p.t)}
              </td>
              <td className="py-1.5 pl-3 text-right text-zinc-900">{fmtSat(p.r)}</td>
              <td className="py-1.5 pl-3 text-right text-zinc-900">{fmtSat(p.e)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ---------------------------------------------------------------- stat card */

function StatCard({
  label,
  value,
  hint,
  delta,
  deltaSuffix,
  accent,
}: {
  label: string;
  value: number | null;
  hint: string;
  delta: number | null;
  deltaSuffix: string;
  accent: string;
}) {
  return (
    <div className="flex flex-1 flex-col rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-2">
        <span aria-hidden className="h-0.5 w-4 rounded-full" style={{ background: accent }} />
        <span className="text-sm font-medium text-zinc-500">{label}</span>
      </div>
      {/* Proportional figures: tabular-nums makes a large standalone number look loose. */}
      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-3xl font-semibold leading-none text-zinc-900 sm:text-4xl">
          {fmtSat(value)}
        </span>
        <span className="text-sm text-zinc-400">sat</span>
      </div>
      {/* Toneless on purpose: reserves and issued ecash normally move together —
          a melt lowers both, a mint raises both — so direction alone is not
          good or bad news, and colouring it would imply otherwise. */}
      <div className="mt-3 text-sm tabular-nums text-zinc-500">
        {fmtSigned(delta)} sat {deltaSuffix}
      </div>
      <p className="mt-auto pt-4 text-xs leading-relaxed text-zinc-400">{hint}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ section */

export default function WatchdogSection() {
  const [data, setData] = useState<WatchdogData | null>(null);
  const [failed, setFailed] = useState(false);
  const [range, setRange] = useState<RangeKey>("24h");
  const [showTable, setShowTable] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const res = await fetch("/api/watchdog");
        const json = await res.json();
        if (cancelled) return;
        if (json?.ok) {
          setData(json as WatchdogData);
          setFailed(false);
        } else {
          setFailed(true);
        }
      } catch {
        if (!cancelled) setFailed(true);
      }
      if (!cancelled) setNow(Date.now());
    };

    load();
    // The route caches for 5 minutes, which is also how often the watchdog
    // collects, so this costs nothing upstream.
    const refresh = setInterval(() => {
      if (!document.hidden) load();
    }, 5 * 60_000);
    const tick = setInterval(() => setNow(Date.now()), 60_000);

    return () => {
      cancelled = true;
      clearInterval(refresh);
      clearInterval(tick);
    };
  }, []);

  const current = data?.ranges?.[range];
  const rangeLabel = RANGES.find((r) => r.key === range)!.long;
  const points = current?.points ?? [];
  const gapHours =
    current?.maxGapMs && current.maxGapMs > 15 * 60_000
      ? (current.maxGapMs / 3_600_000).toFixed(1)
      : null;

  return (
    <section id="watchdog" className="bg-zinc-50 py-24">
      <div className="mx-auto max-w-7xl px-6 xl:px-8">
        <div className="mb-10 max-w-3xl">
          <h2 className="mb-4 text-4xl font-bold text-zinc-900 sm:text-5xl">Minibits Watchdog</h2>
          <p className="text-lg text-zinc-600">
            An independent watchdog continuously checks that the value backing the mint still
            matches the ecash the mint has issued. It reads the Lightning node and the mint
            read-only, every five minutes, and alerts the operator on discrepancies, stuck
            operations and node problems. What it records is internal — the two figures below are
            the public part of it.
          </p>
        </div>

        {/* One filter row, above everything it scopes: both cards and the chart
            re-render against the same window, so the numbers always agree. */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="mr-1 text-xs font-medium text-zinc-500">Window</span>
            {RANGES.map((r) => (
              <button
                key={r.key}
                type="button"
                onClick={() => setRange(r.key)}
                aria-pressed={range === r.key}
                className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                  range === r.key
                    ? "border-zinc-300 bg-white font-semibold text-zinc-900 shadow-sm"
                    : "border-transparent text-zinc-500 hover:bg-white hover:text-zinc-700"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
          <div className="text-xs text-zinc-400">
            {failed && !data
              ? "watchdog unavailable"
              : data
              ? `last updated ${formatAge(data.updatedAt, now)}`
              : "loading…"}
          </div>
        </div>

        {failed && !data ? (
          <div className="rounded-2xl border border-zinc-200 bg-white p-10 text-center text-sm text-zinc-500">
            Watchdog figures are temporarily unavailable.
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="flex flex-col gap-6">
              <StatCard
                label="Reserves"
                value={data?.reserves ?? null}
                delta={current?.deltaReserves ?? null}
                deltaSuffix={`over ${rangeLabel}`}
                hint="Lightning channel balances, on-chain funds and declared cold storage — everything that backs the issued ecash."
                accent={RESERVES_COLOR}
              />
              <StatCard
                label="Ecash issued"
                value={data?.ecashIssued ?? null}
                delta={current?.deltaEcashIssued ?? null}
                deltaSuffix={`over ${rangeLabel}`}
                hint="Ecash in circulation and not yet redeemed — what the mint owes its users."
                accent={ECASH_COLOR}
              />
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm lg:col-span-2">
              <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-zinc-900">
                    Reserves against issued ecash
                  </h3>
                  <p className="mt-0.5 text-xs text-zinc-500">
                    Both in sat, on one axis, over {rangeLabel}.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowTable((v) => !v)}
                  aria-pressed={showTable}
                  className="shrink-0 rounded-lg border border-zinc-200 px-2.5 py-1 text-xs text-zinc-500 transition-colors hover:bg-zinc-50 hover:text-zinc-700"
                >
                  {showTable ? "Chart" : "Table"}
                </button>
              </div>

              {/* A legend is always present for two series, so identity never
                  rests on colour alone. The values live in the cards beside it,
                  the tooltip, and the table view — never hover-only. The table
                  names its own columns, so the legend would only repeat them. */}
              {!showTable && (
                <div className="mb-3 flex flex-wrap items-center gap-x-6 gap-y-1 text-xs">
                  <LegendItem color={RESERVES_COLOR} label="Reserves" />
                  <LegendItem color={ECASH_COLOR} label="Ecash issued" />
                </div>
              )}

              {data ? (
                showTable ? (
                  <SeriesTable points={points} />
                ) : (
                  <WatchdogChart points={points} range={range} />
                )
              ) : (
                <div className="flex h-[300px] items-center justify-center text-sm text-zinc-400">
                  Loading observations…
                </div>
              )}

              {gapHours && (
                <p className="mt-2 text-xs text-amber-600">
                  This window contains a {gapHours}h collection gap — the readings either side are
                  real, but the period between them was not observed.
                </p>
              )}
            </div>
          </div>
        )}

        <div className="mt-8 flex justify-end">
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-5 py-3 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100"
          >
            Monitor your own mint
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
              />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-2">
      {/* A line key, mirroring the mark it stands for. */}
      <span aria-hidden className="h-0.5 w-4 rounded-full" style={{ background: color }} />
      <span className="text-zinc-600">{label}</span>
    </span>
  );
}
