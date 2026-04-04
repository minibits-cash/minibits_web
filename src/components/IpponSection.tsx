"use client";

import { useEffect, useState } from "react";
import SlideshowImage from "./SlideshowImage";

const CLI_STEPS = [
  {
    cmd: "wallet create agent-session-1",
    response: '{"access_key":"adg-08m","name":"agent-session-1","mint":"https://mint.minibits.cash/Bitcoin","unit":"sat","balance":0,"pending_balance":0}',
  },
  {
    cmd: "wallet adg-08m deposit 100",
    response: '{"quote":"abc123...","request":"lnbc1000n...","state":"UNPAID","expiry":1234567890}',
  },
  {
    cmd: "wallet adg-08m deposit-check abc123...",
    response: '{"quote":"abc123...","request":"lnbc1000n...","state":"PAID","expiry":1234567890}',
  },
  {
    cmd: "wallet adg-08m balance",
    response: '{"access_key":"adg-08m","name":"agent-session-1","mint":"https://mint.minibits.cash/Bitcoin","unit":"sat","balance":100,"pending_balance":0}',
  },
  {
    cmd: "wallet adg-08m pay lnbc500n...",
    response: '{"quote":"xyz987...","amount":50,"fee_reserve":1,"state":"PAID","payment_preimage":"...","expiry":1234567890}',
  },
];

function CliDemo() {
  const [history, setHistory] = useState<Array<{ cmd: string; response: string }>>([]);
  const [currentCmd, setCurrentCmd] = useState("");
  const [cursorVisible, setCursorVisible] = useState(true);
  const [stepIndex, setStepIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [phase, setPhase] = useState<"typing" | "showing">("typing");

  useEffect(() => {
    const id = setInterval(() => setCursorVisible((v) => !v), 530);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (stepIndex >= CLI_STEPS.length) return;
    const step = CLI_STEPS[stepIndex];

    if (phase === "typing") {
      if (charIndex < step.cmd.length) {
        const id = setTimeout(() => {
          setCurrentCmd(step.cmd.slice(0, charIndex + 1));
          setCharIndex((c) => c + 1);
        }, 45);
        return () => clearTimeout(id);
      } else {
        const id = setTimeout(() => setPhase("showing"), 350);
        return () => clearTimeout(id);
      }
    } else {
      const id = setTimeout(() => {
        const next = stepIndex + 1;
        setHistory((h) => [...h, { cmd: step.cmd, response: step.response }]);
        if (next < CLI_STEPS.length) {
          setStepIndex(next);
          setCharIndex(0);
          setCurrentCmd("");
          setPhase("typing");
        } else {
          setTimeout(() => {
            setHistory([]);
            setStepIndex(0);
            setCharIndex(0);
            setCurrentCmd("");
            setPhase("typing");
          }, 3000);
        }
      }, 900);
      return () => clearTimeout(id);
    }
  }, [stepIndex, charIndex, phase]);

  const currentStep = CLI_STEPS[stepIndex];

  return (
    <div className="max-h-72 overflow-auto space-y-3 font-mono text-sm">
      {history.map((item, i) => (
        <div key={i}>
          <div className="text-zinc-300">
            <span className="text-[#3680FA]">&gt;</span> {item.cmd}
          </div>
          <div className="mt-1 break-all text-[#599D52]">{item.response}</div>
        </div>
      ))}
      {stepIndex < CLI_STEPS.length && (
        <div>
          <div className="text-zinc-300">
            <span className="text-[#3680FA]">&gt;</span> {currentCmd}
            {phase === "typing" && (
              <span className={cursorVisible ? "opacity-100" : "opacity-0"}>▋</span>
            )}
          </div>
          {phase === "showing" && (
            <div className="mt-1 break-all text-[#599D52]">{currentStep.response}</div>
          )}
        </div>
      )}
    </div>
  );
}

type IpponStatus = "loading" | "operational" | "unavailable";

function IpponStatusDot({ status }: { status: IpponStatus }) {
  const colors: Record<IpponStatus, string> = {
    loading: "bg-yellow-400",
    operational: "bg-green-400",
    unavailable: "bg-red-500",
  };
  const labels: Record<IpponStatus, string> = {
    loading: "Loading",
    operational: "Operational",
    unavailable: "Unavailable",
  };
  return (
    <span className="flex items-center gap-2">
      <span
        className={`inline-block h-3 w-3 rounded-full ${colors[status]} ${
          status === "loading" ? "animate-pulse" : ""
        }`}
      />
      <span
        className={`text-sm font-semibold ${
          status === "operational"
            ? "text-green-600"
            : status === "loading"
            ? "text-yellow-600"
            : "text-red-600"
        }`}
      >
        {labels[status]}
      </span>
    </span>
  );
}

type IpponCard = {
  title: string;
  text: string;
  video: boolean;
  images?: string[];
  imageClass?: string;
  link?: { label: string; href: string };
};

const IPPON_CARDS: IpponCard[] = [
  {
    title: "REST API & CLI",
    text: "Ippon exposes a simple, versioned REST API so AI agents can create wallets, deposit sats, send and receive ecash tokens, and pay Lightning invoices — all over HTTP. A CLI mode with SQLite is also available for local, self-hosted use.",
    video: false,
    link: { label: "Live Ippon server", href: "https://ippon.minibits.cash/v1" },
  },
  {
    title: "Seedless, short-lived wallets",
    text: "AI agents operate with short-lived wallets and minimal balances. Ippon is designed for exactly this: no seed phrases, no UI, just a lightweight access key per wallet and a clean JSON API.",
    video: false,
    link: { label: "Ippon Github", href: "https://github.com/minibits-cash/minibits_ippon" },
  },
  {
    title: "MCP server",
    text: "To facilitate use by AI agents, Ippon includes a built-in MCP (Mint Communication Protocol) server, allowing it to interact with the wallet in network (API) mode.",
    video: false,
    link: { label: "Ippon MCP server", href: "https://ippon.minibits.cash/mcp" },
  },
];

const API_ENDPOINTS = [
  { key:1, method: "POST", path: "/v1/wallet", desc: "Create new wallet" },
  { key:2, method: "POST", path: "/v1/wallet/deposit", desc: "Fund via Lightning invoice" },
  { key:3, method: "GET", path: "/v1/wallet", desc: "Get wallet balance and limits" },
  { key:4, method: "POST", path: "/v1/wallet/send", desc: "Export ecash token" },
  { key:5, method: "POST", path: "/v1/wallet/pay", desc: "Pay Lightning invoice or address" },
  { key:6, method: "POST", path: "/v1/wallet/receive", desc: "Receive token to wallet" },
  { key:7, method: "GET", path: "/v1/wallet/decode", desc: "Decodes Cashu token or lightning invoice" },
  { key:8, method: "GET", path: "/v1/rate/:currency", desc: "Get fiat exchange rate" },
];

export default function IpponSection() {
  const [status, setStatus] = useState<IpponStatus>("loading");
  const [mcpStatus, setMcpStatus] = useState<IpponStatus>("loading");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/ippon-status")
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setStatus(data.ok ? "operational" : "unavailable");
      })
      .catch(() => {
        if (!cancelled) setStatus("unavailable");
      });
    fetch("/api/ippon-mcp-status")
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setMcpStatus(data.ok ? "operational" : "unavailable");
      })
      .catch(() => {
        if (!cancelled) setMcpStatus("unavailable");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section id="ippon" className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-6 xl:px-8">
        {/* Section header */}
        <div className="mb-16 max-w-2xl">
          {/*<div className="mb-4 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-4 py-1.5 text-xs font-medium text-zinc-500">
            🤖 Minibits Ippon
          </div>*/}
          <h2 className="mb-4 text-4xl font-bold text-zinc-900 sm:text-5xl">
            Minibits Ippon
          </h2>
          <p className="mb-4 text-lg text-zinc-600">
            Minibits Ippon is a minimalistic ecash and Lightning wallet implementing the Cashu
            protocol — designed from the ground up for{" "}
            <strong className="text-zinc-800">AI agents</strong>.
          </p>
          <p className="mb-6 text-base text-zinc-500">
            AI agents that need to make or receive micropayments can create a wallet via a single
            HTTP call or a CLI command, fund it with Lightning, and start transacting in seconds. No UI. No seed
            phrases. No complexity.
          </p>

          {/* Status indicator */}
          <div className="inline-flex flex-wrap items-center gap-3 rounded-xl border border-zinc-200 bg-zinc-50 px-5 py-3">
            <span className="text-sm text-zinc-500 font-medium">ippon.minibits.cash</span>
            <span className="text-zinc-300">·</span>
            <span className="text-xs text-zinc-400">Wallet</span>
            <IpponStatusDot status={status} />
            <span className="text-zinc-300">·</span>
            <span className="text-xs text-zinc-400">MCP server</span>
            <IpponStatusDot status={mcpStatus} />
          </div>
        </div>

        {/* Cards */}
        <div className="mb-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {IPPON_CARDS.map((card) => (
            <div
              key={card.title}
              className="group flex flex-col rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              {/* Media */}
              {/*<div className="relative mb-5 h-45 w-full overflow-hidden rounded-xl border border-dashed border-zinc-200 bg-zinc-50">
                {card.images && card.images.length > 0 ? (
                  <SlideshowImage images={card.images} alt={card.title} className={card.imageClass} />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-sm text-zinc-300">
                    [ image placeholder ]
                  </div>
                )}
              </div>*/}
              <h3 className="mb-2 text-lg font-semibold text-zinc-900">{card.title}</h3>
              <p className="text-sm leading-relaxed text-zinc-600">{card.text}</p>
              {card.link && (
                <a
                  href={card.link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto pt-4 inline-flex items-center gap-1 text-sm font-medium text-[#3680FA] hover:underline"
                >
                  {card.link.label}
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                  </svg>
                </a>
              )}
            </div>
          ))}
        </div>

        {/* Dark cards: API reference + CLI demo */}
        <div className="grid gap-6 lg:grid-cols-2">

        {/* API quick reference */}
        <div className="rounded-2xl border border-zinc-200 bg-zinc-950 p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex gap-1.5">
              <div className="h-3 w-3 rounded-full bg-red-500" />
              <div className="h-3 w-3 rounded-full bg-yellow-500" />
              <div className="h-3 w-3 rounded-full bg-green-500" />
            </div>
            <span className="font-mono text-sm text-zinc-400">Ippon REST API — quick reference</span>
          </div>
          <div className="space-y-3">
            {API_ENDPOINTS.map((ep) => (
              <div key={ep.key} className="flex items-center gap-4">
                <span
                  className={`w-14 shrink-0 rounded px-2 py-0.5 text-center font-mono text-xs font-bold ${
                    ep.method === "POST"
                      ? "bg-[#3680FA]/20 text-[#3680FA]"
                      : "bg-[#599D52]/20 text-[#599D52]"
                  }`}
                >
                  {ep.method}
                </span>
                <code className="font-mono text-sm text-zinc-300">{ep.path}</code>
                <span className="text-sm text-zinc-500">— {ep.desc}</span>
              </div>
            ))}
          </div>
          <div className="mt-6 border-t border-zinc-800 pt-5">
            <a
              href="https://github.com/minibits-cash/minibits_ippon"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800 px-5 py-2.5 text-sm font-medium text-zinc-200 transition hover:bg-zinc-700"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
              </svg>
              View on GitHub
            </a>
          </div>
        </div>

        {/* CLI demo */}
        <div className="rounded-2xl border border-zinc-200 bg-zinc-950 p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex gap-1.5">
              <div className="h-3 w-3 rounded-full bg-red-500" />
              <div className="h-3 w-3 rounded-full bg-yellow-500" />
              <div className="h-3 w-3 rounded-full bg-green-500" />
            </div>
            <span className="font-mono text-sm text-zinc-400">Ippon CLI — demo session</span>
          </div>
          <CliDemo />
        </div>

        </div>
      </div>
    </section>
  );
}
