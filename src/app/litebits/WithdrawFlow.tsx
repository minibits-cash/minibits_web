"use client";

import { useEffect, useState } from "react";

const AMOUNT = 100;
const CYCLE_MS = 6000; // hold 1.5s, transfer 2s, hold 2.5s

export function StepLabel({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <p className="relative mb-4 flex items-center justify-center gap-3 lg:justify-start text-sm font-semibold uppercase tracking-widest text-[#FFC233]">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#FFD700] to-[#FF8C00] text-sm text-zinc-950">
        {n}
      </span>
      {children}
    </p>
  );
}

function useTransfer() {
  const [moved, setMoved] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = ((now - start) % CYCLE_MS - 1500) / 2000;
      const p = Math.min(1, Math.max(0, t));
      const eased = p < 0.5 ? 2 * p * p : 1 - (-2 * p + 2) ** 2 / 2;
      setMoved(Math.round(eased * AMOUNT));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  return moved;
}

export default function WithdrawFlow() {
  const moved = useTransfer();

  return (
    <div className="grid w-full grid-cols-1 gap-8 text-left">
      {/* Step 2: LiteBits */}
      <div className="flex flex-col">
        <StepLabel n={2}>Tap Withdraw in LiteBits</StepLabel>
        <a
          href="https://t.me/litebits_faucet_bot/app"
          target="_blank"
          rel="noopener noreferrer"
          className="mx-auto flex w-full max-w-sm lg:mx-0 flex-1 flex-col items-center rounded-2xl border border-zinc-700/70 bg-[#141821] px-3 py-5 text-center shadow-xl transition hover:scale-[1.02] hover:border-[#FFB000]/60"
        >
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#3ecf9a] sm:text-xs">
            Claim successful
          </span>
          <span className="mt-1 flex items-baseline gap-1.5">
            <span className="text-4xl font-black text-white sm:text-5xl">+1</span>
            <span className="text-base font-bold tracking-tight text-zinc-400">Coins</span>
          </span>
          <span className="mt-1 text-sm font-bold text-[#FFC94A]">+10 XP</span>
          <span className="mt-3 flex items-center gap-1.5 text-sm text-zinc-400">
            <span className="h-4 w-4 rounded-full bg-[radial-gradient(circle_at_35%_30%,#FFE58A,#F5A300_60%,#C77800)]" />
            Balance
            <span className="w-8 text-center font-bold tabular-nums text-white">{AMOUNT - moved}</span>
            Coins
          </span>
          <span className="mt-auto w-full pt-4">
            <span className="block rounded-xl bg-gradient-to-r from-[#FFD700] to-[#FF8C00] py-2.5 text-sm font-bold text-zinc-950">
              Withdraw
            </span>
          </span>
        </a>
      </div>

      {/* Step 3: Minibits */}
      <div className="flex flex-col">
        <StepLabel n={3}>Claim in Minibits</StepLabel>
        <div className="mx-auto w-full max-w-sm lg:mx-0 overflow-hidden rounded-2xl shadow-xl">
          <div className="flex flex-col items-center bg-[#2a3ad6] px-3 py-6">
            <span className="flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs text-white">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#f7931a] text-[9px] font-bold">₿</span>
              SAT
            </span>
            <span className="mt-2 text-4xl font-bold tabular-nums text-white sm:text-5xl">{moved}</span>
            <span className="mt-2 flex items-center gap-1.5 text-xs text-white/90">
              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-[#f0a32c] text-[11px]">🏛</span>
              Minibits mint
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
