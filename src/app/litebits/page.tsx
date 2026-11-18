import type { Metadata } from "next";
import Image from "next/image";
import Footer from "@/components/Footer";
import { STORE_LINKS } from "@/components/storeLinks";

export const metadata: Metadata = {
  title: "Minibits × LiteBits — Withdraw your sats as ecash",
  description:
    "Withdraw small amounts from LiteBits straight into Minibits, a free Bitcoin ecash wallet. No sign up.",
};

const STEPS = [
  { icon: "📲", text: "Install Minibits" },
  { icon: "⚡", text: "Tap Withdraw in LiteBits" },
  { icon: "🔗", text: "Open the link in Minibits" },
];

const PERKS = ["Free", "No sign up", "Tiny amounts OK"];

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
              sats.
              <br />
              <span style={{ color: "#599D52" }}>Keep them as ecash.</span>
            </h1>

            <p className="mb-6 text-lg text-zinc-300">
              Minibits is a free Bitcoin wallet made for small amounts. Receive, keep and send sats in seconds.
            </p>

            <ul className="mb-8 flex flex-wrap justify-center gap-2 lg:justify-start">
              {PERKS.map((p) => (
                <li
                  key={p}
                  className="rounded-full border border-[#599D52]/40 bg-[#599D52]/10 px-3 py-1 text-sm font-medium text-[#8fd387]"
                >
                  ✓ {p}
                </li>
              ))}
            </ul>

            {/* Steps */}
            <ol className="mb-10 grid w-full grid-cols-3 gap-3">
              {STEPS.map((s, i) => (
                <li
                  key={s.text}
                  className="flex flex-col items-center gap-2 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-3 text-center backdrop-blur-sm"
                >
                  <span className="text-2xl" aria-hidden>{s.icon}</span>
                  <span className="text-xs font-semibold text-[#3680FA]">{i + 1}</span>
                  <span className="text-sm leading-snug text-zinc-200">{s.text}</span>
                </li>
              ))}
            </ol>

            {/* Store buttons */}
            <div className="mb-6 flex flex-wrap justify-center gap-3 lg:justify-start">
              {STORE_LINKS.map((store) => (
                <a
                  key={store.label}
                  href={store.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-2.5 rounded-xl border ${store.border} ${store.bg} px-5 py-3 text-sm font-medium text-zinc-100 transition-all duration-200 hover:scale-105 hover:shadow-lg`}
                >
                  {store.icon}
                  {store.label}
                </a>
              ))}
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
