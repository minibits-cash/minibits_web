import { NextResponse } from "next/server";

/**
 * Public, minimal view of the Minibits watchdog.
 *
 * The watchdog API lives on a private container network and is deliberately not
 * published to the internet. Browsers therefore only ever talk to this route,
 * which:
 *
 *  - reads the watchdog server-side, so its address never reaches the bundle;
 *  - forwards nothing verbatim — the upstream payload is reduced here to the
 *    handful of figures the public section renders (reserves, the mint's own
 *    on-chain balance, ecash issued, their change over a window, and a
 *    downsampled series of the first and last). Own capital, unclaimed
 *    balances, node internals and alerts stay inside;
 *  - caches in memory for 5 minutes, matching the watchdog's own collection
 *    interval, so page traffic cannot turn into upstream load.
 */
export const dynamic = "force-dynamic";

const CACHE_TTL_MS = 5 * 60_000;
/** After a failed read, don't hammer the watchdog on every page view. */
const ERROR_BACKOFF_MS = 30_000;
const REQUEST_TIMEOUT_MS = 8_000;

/** The watchdog collects every 5 minutes; a longer silence is a real gap. */
const COLLECTION_INTERVAL_MS = 5 * 60_000;

/**
 * One upstream call covers all three windows: the longest one is fetched and
 * the shorter ones are sliced out of it. Point budgets are per window because
 * 7 days of 5-minute samples is ~2000 points — far more than a 600px-wide
 * chart can draw, and all of it payload the browser would pay for.
 */
const RANGES = [
  { key: "6h", minutes: 360, maxPoints: 80 },
  { key: "24h", minutes: 1440, maxPoints: 100 },
  { key: "7d", minutes: 10_080, maxPoints: 120 },
] as const;

type RangeKey = (typeof RANGES)[number]["key"];

/** `r`/`e` are null only on a synthetic gap marker — see insertGaps(). */
type Point = { t: number; r: number | null; e: number | null };

type RangeData = {
  deltaReserves: number | null;
  deltaEcashIssued: number | null;
  samples: number;
  from: number | null;
  to: number | null;
  /** Longest unobserved stretch inside the window, in ms. */
  maxGapMs: number | null;
  points: Point[];
};

type Payload = {
  updatedAt: string | null;
  unit: "sat";
  reserves: number | null;
  /** The mint's own on-chain wallet — a part of reserves, not a term beside it. */
  mintOnchain: number | null;
  ecashIssued: number | null;
  ranges: Record<RangeKey, RangeData>;
};

/** Raw sample, already reduced to the public figures. */
type Sample = { t: number; reserves: number; ecash: number; mintOnchain: number };

type UpstreamPoint = {
  t: string;
  unit: string;
  totalNodeBalance: string;
  coldStorage: string;
  mintOnchain: string;
  mintBalance: string;
};

const THOUSAND = BigInt(1000); // not `1000n`: tsconfig targets ES2017.

/**
 * msat arrive as decimal strings because they are BigInt server-side and would
 * lose precision as JSON numbers. Divide as BigInt, convert to Number only once
 * the value is in sat — where it is far inside the safe-integer range.
 */
function msatToSat(v: string | null | undefined): number | null {
  if (v === null || v === undefined || v === "") return null;
  try {
    return Number(BigInt(v) / THOUSAND);
  } catch {
    return null;
  }
}

function watchdogUrl(path: string): string | null {
  const host = process.env.WATCHDOG_API_HOST;
  if (!host) return null;
  const port = process.env.WATCHDOG_API_PORT ?? "3005";
  return `http://${host}:${port}${path}`;
}

async function fetchSamples(): Promise<Sample[]> {
  const longest = RANGES[RANGES.length - 1].minutes;
  const url = watchdogUrl(`/api/timeseries?minutes=${longest}`);
  if (!url) throw new Error("WATCHDOG_API_HOST is not configured");

  const res = await fetch(url, {
    cache: "no-store",
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`watchdog responded ${res.status}`);

  const body = (await res.json()) as { points?: UpstreamPoint[] };
  const raw = body.points ?? [];

  // Reconciliation rows are per unit. The mint is sat-only, but filter rather
  // than assume — interleaving two units would silently double the series.
  const sat = raw.filter((p) => p.unit === "sat");
  const points = sat.length > 0 ? sat : raw;

  const samples: Sample[] = [];
  for (const p of points) {
    const node = msatToSat(p.totalNodeBalance);
    const cold = msatToSat(p.coldStorage);
    const onchain = msatToSat(p.mintOnchain);
    const ecash = msatToSat(p.mintBalance);
    const t = new Date(p.t).getTime();
    if (node === null || cold === null || onchain === null || ecash === null) continue;
    if (!Number.isFinite(t)) continue;
    // Reserves as the watchdog defines them: node balance + declared cold
    // storage + the mint's own on-chain wallet.
    samples.push({ t, reserves: node + cold + onchain, ecash, mintOnchain: onchain });
  }
  samples.sort((a, b) => a.t - b.t);
  return samples;
}

/**
 * Keep the last sample of each bucket rather than averaging.
 *
 * These are balances, not rates: the value at the end of a bucket is a reading
 * that actually occurred, while a mean of readings is a number that never did.
 */
function downsample(samples: Sample[], maxPoints: number): Sample[] {
  if (samples.length <= maxPoints) return samples;
  const span = samples[samples.length - 1].t - samples[0].t;
  const bucketMs = Math.max(1, Math.ceil(span / maxPoints));
  const out: Sample[] = [];
  let bucket = -1;
  for (const s of samples) {
    const b = Math.floor(s.t / bucketMs);
    if (b === bucket) out[out.length - 1] = s;
    else {
      out.push(s);
      bucket = b;
    }
  }
  return out;
}

/**
 * Break the line wherever collection stopped.
 *
 * Joining across a gap would draw a straight segment through hours nobody
 * observed, implying the balances moved smoothly when we have no idea what they
 * did. A null-valued point at the midpoint leaves a visible discontinuity.
 */
function insertGaps(points: Point[], stepMs: number): Point[] {
  const threshold = Math.max(COLLECTION_INTERVAL_MS * 3, stepMs * 2.5);
  const out: Point[] = [];
  for (let i = 0; i < points.length; i++) {
    if (i > 0 && points[i].t - points[i - 1].t > threshold) {
      out.push({ t: Math.round((points[i].t + points[i - 1].t) / 2), r: null, e: null });
    }
    out.push(points[i]);
  }
  return out;
}

/**
 * Change is measured between the window's ENDPOINTS, not by summing per-tick
 * differences, so a gap in the series cannot accumulate error — the same way
 * the watchdog's own /deltas endpoint computes it.
 */
function buildRange(samples: Sample[], minutes: number, maxPoints: number, now: number): RangeData {
  const from = now - minutes * 60_000;
  const inWindow = samples.filter((s) => s.t >= from);

  if (inWindow.length === 0) {
    return {
      deltaReserves: null,
      deltaEcashIssued: null,
      samples: 0,
      from: null,
      to: null,
      maxGapMs: null,
      points: [],
    };
  }

  const first = inWindow[0];
  const last = inWindow[inWindow.length - 1];

  let maxGapMs = 0;
  for (let i = 1; i < inWindow.length; i++) {
    const gap = inWindow[i].t - inWindow[i - 1].t;
    if (gap > maxGapMs) maxGapMs = gap;
  }

  const kept = downsample(inWindow, maxPoints);
  const stepMs =
    kept.length > 1 ? (kept[kept.length - 1].t - kept[0].t) / (kept.length - 1) : COLLECTION_INTERVAL_MS;

  return {
    // Two readings are the minimum a change can be measured from.
    deltaReserves: inWindow.length > 1 ? last.reserves - first.reserves : null,
    deltaEcashIssued: inWindow.length > 1 ? last.ecash - first.ecash : null,
    samples: inWindow.length,
    from: first.t,
    to: last.t,
    maxGapMs: inWindow.length > 1 ? maxGapMs : null,
    points: insertGaps(
      kept.map((s) => ({ t: s.t, r: s.reserves, e: s.ecash })),
      stepMs
    ),
  };
}

async function buildPayload(): Promise<Payload> {
  const samples = await fetchSamples();
  const now = Date.now();
  const latest = samples.length > 0 ? samples[samples.length - 1] : null;

  const ranges = {} as Record<RangeKey, RangeData>;
  for (const r of RANGES) {
    ranges[r.key] = buildRange(samples, r.minutes, r.maxPoints, now);
  }

  return {
    updatedAt: latest ? new Date(latest.t).toISOString() : null,
    unit: "sat",
    reserves: latest ? latest.reserves : null,
    mintOnchain: latest ? latest.mintOnchain : null,
    ecashIssued: latest ? latest.ecash : null,
    ranges,
  };
}

let cache: { payload: Payload; at: number } | null = null;
let retryAfter = 0;
/**
 * Collapses a burst of concurrent requests into one upstream read — without it,
 * every request arriving while the cache is cold starts its own.
 */
let inflight: Promise<void> | null = null;

async function ensureFresh(): Promise<void> {
  const now = Date.now();
  if (cache && now - cache.at < CACHE_TTL_MS) return;
  if (now < retryAfter) return;

  if (!inflight) {
    inflight = (async () => {
      try {
        const payload = await buildPayload();
        cache = { payload, at: Date.now() };
        retryAfter = 0;
      } catch {
        // Keep whatever we last read; it is stamped with its own observation
        // time, so a stale figure is visibly stale rather than wrong.
        retryAfter = Date.now() + ERROR_BACKOFF_MS;
      } finally {
        inflight = null;
      }
    })();
  }
  await inflight;
}

export async function GET() {
  await ensureFresh();

  const headers = { "cache-control": "no-store" };

  if (!cache) {
    return NextResponse.json({ ok: false }, { status: 200, headers });
  }

  return NextResponse.json(
    { ok: true, stale: Date.now() - cache.at >= CACHE_TTL_MS, ...cache.payload },
    { status: 200, headers }
  );
}
