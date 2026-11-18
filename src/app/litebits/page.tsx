import type { Metadata } from "next";
import Image from "next/image";
import Footer from "@/components/Footer";
import { STORE_LINKS } from "@/components/storeLinks";

export const metadata: Metadata = {
  title: "Minibits × LiteBits — Withdraw your sats as ecash",
  description:
    "Withdraw small amounts from LiteBits straight into Minibits, a free Bitcoin ecash wallet. No sign up.",
};

const PERKS = ["Free", "No sign up", "Lightning address"];

export default function LiteBitsPage() {
  return (
    <>
      <main className="animated-grid-bg min-h-svh">
        <div className="gradient-overlay" />
        <div className="relative z-10 mx-auto flex min-h-svh max-w-6xl flex-col items-center justify-center gap-12 px-4 py-12 sm:px-6 lg:flex-row lg:gap-16">
          {/* Left: message + CTA */}
          <div className="flex max-w-xl flex-col items-center text-center lg:items-start lg:text-left">
            {/* Logos */}
            <div className="mb-8 flex items-center gap-4">
              <Image src="/icon-192.png" alt="Minibits" width={56} height={56} className="rounded-2xl" />
              <span className="text-2xl text-zinc-500">×</span>
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-900 ring-1 ring-zinc-700">
                <img src="/img/litebits-logo.svg" alt="LiteBits" className="h-11 w-11" />
              </span>
            </div>

            <h1
              className="mb-4 text-4xl leading-tight text-zinc-100 sm:text-5xl lg:text-6xl"
              style={{ fontFamily: "var(--font-hammersmith)" }}
            >
              Withdraw your{" "}
              <span className="bg-gradient-to-r from-[#FFD700] to-[#FF8C00] bg-clip-text text-transparent">
                LiteBits
              </span>{" "}
              sats to <span style={{ color: "#599D52" }}>Minibits</span> wallet.
            </h1>

            <p className="mb-6 text-lg text-zinc-300">
              Minibits is a Bitcoin Lightning and ecash wallet with instant, low-cost, and private payments.
            </p>

            <ul className="mb-10 flex flex-wrap justify-center gap-3 lg:justify-start">
              {PERKS.map((p) => (
                <li
                  key={p}
                  className="rounded-full border border-[#599D52]/40 bg-[#599D52]/10 px-5 py-2 text-base font-semibold text-[#8fd387] sm:text-lg"
                >
                  ✓ {p}
                </li>
              ))}
            </ul>

            {/* Store buttons */}
            <div className="relative mb-8 w-full">
              <div
                aria-hidden
                className="pointer-events-none absolute -inset-6 rounded-[2rem] bg-[radial-gradient(ellipse_at_center,rgba(255,170,0,0.22),transparent_70%)] blur-xl"
              />
              <p className="relative mb-4 text-sm font-semibold uppercase tracking-widest text-[#FFC233]">
                Download free
              </p>
              <div className="relative flex flex-wrap justify-center gap-3 lg:justify-start">
                {STORE_LINKS.filter((s) => s.label !== "FreedomStore").map((store) => (
                  <a
                    key={store.label}
                    href={store.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 rounded-2xl border border-[#FFB000]/50 bg-zinc-900 px-6 py-4 text-base font-semibold text-zinc-100 shadow-[0_0_24px_-4px_rgba(255,170,0,0.45)] transition-all duration-200 hover:scale-105 hover:border-[#FFB000] hover:shadow-[0_0_36px_-2px_rgba(255,170,0,0.7)] [&_svg]:h-5 [&_svg]:w-5"
                  >
                    {store.icon}
                    {store.label}
                  </a>
                ))}
              </div>
            </div>

            <a href="/" className="text-sm text-zinc-500 underline-offset-4 transition hover:text-zinc-300 hover:underline">
              Learn more about Minibits →
            </a>
          </div>

          {/* Right: app demo */}
          <video
            autoPlay
            loop
            muted
            playsInline
            className="hidden h-[600px] w-auto shrink-0 rounded-2xl shadow-2xl lg:block"
          >
            <source src="/videos/receive_scan_token.mp4" type="video/mp4" />
          </video>
        </div>
      </main>
      <Footer />
    </>
  );
}
