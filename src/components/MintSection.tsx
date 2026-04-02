"use client";

import React, { useEffect, useState } from "react";
import SlideshowImage from "./SlideshowImage";

type MintStatus = "loading" | "operational" | "unavailable";

function StatusDot({ status }: { status: MintStatus }) {
  const colors: Record<MintStatus, string> = {
    loading: "bg-yellow-400",
    operational: "bg-green-400",
    unavailable: "bg-red-500",
  };
  const labels: Record<MintStatus, string> = {
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

type MintCard = {
  title: string;
  text: string;
  link?: { label: string; href: string };
  image?: string;
  images?: string[];
  imageClass?: string;
};

const MINT_CARDS: MintCard[] = [
  {
    title: "Cashu Ecash",
    text: "Minibits mint implements the Cashu protocel with high privacy guarantees - mint never learns your balance or transactions. Issued tokens are bearer instruments with instant and even offline exchange.",
    link: { label: "Learn about Cashu", href: "https://cashu.space" },
    image: "https://cashu.space/mstile-150x150.png",
    imageClass: "h-full object-contain w-full",
  },
  {
    title: "Lightning-backed",
    text: "The mint is backed by the Bitcoin Lightning Network, enabling seamless in-and-out conversion between ecash and Lightning payments at any time.",
    link: { label: "Minibits Lightning node", href: "https://www.amboss.space/node/0330974249e7f1d9f515e04af3bc664b2e924641de53bb43fb9efe3fa6edf0e2ae" },
    image: "/img/lightning_network.png",
  },
  {
    title: "Recovery",
    text: "Ecash tokens can be recovered if your device is lost or damaged. The mint provides a fast and wallet-independent recovery service that allows you to restore your balance using a seed phrase.",
    link: { label: "Minibits recovery tool", href: "https://recovery.minibits.cash" },
    image: "/img/recovery.png",
  },
];


export default function MintSection() {
  const [status, setStatus] = useState<MintStatus>("loading");
  const [lndStatus, setLndStatus] = useState<MintStatus>("loading");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/mint-status")
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setStatus(data.ok ? "operational" : "unavailable");
      })
      .catch(() => {
        if (!cancelled) setStatus("unavailable");
      });
    fetch("/api/lnd-status")
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setLndStatus(data.ok ? "operational" : "unavailable");
      })
      .catch(() => {
        if (!cancelled) setLndStatus("unavailable");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section id="mint" className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-6 xl:px-8">
        {/* Section header */}
        <div className="mb-16 max-w-2xl">
          {/*<div className="mb-4 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-4 py-1.5 text-xs font-medium text-zinc-500">
            🏦 Minibits Mint
          </div>*/}
          <h2 className="mb-4 text-4xl font-bold text-zinc-900 sm:text-5xl">
            Minibits Mint
          </h2>
          <p className="mb-6 text-lg text-zinc-600">
            Minibits mint issues ecash with SAT unit and serves for testing purposes only.
            When using ecash, you trust the issuing mint to redeem it back for bitcoin. Use only with small amounts and at your own risk. We encourage communities to set up their own mints for production use.
          </p>

          {/* Status indicator */}
          <div className="inline-flex flex-wrap items-center gap-3 rounded-xl border border-zinc-200 bg-zinc-50 px-5 py-3">
            <span className="text-sm text-zinc-500 font-medium">mint.minibits.cash</span>
            <span className="text-zinc-300">·</span>
            <span className="text-xs text-zinc-400">Mint</span>
            <StatusDot status={status} />
            <span className="text-zinc-300">·</span>
            <span className="text-xs text-zinc-400">Lightning node</span>
            <StatusDot status={lndStatus} />
          </div>
        </div>

        {/* Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {MINT_CARDS.map((card) => (
            <div
              key={card.title}
              className="group flex flex-col rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              {/* Media */}
              <div className="relative mb-5 h-45 w-full overflow-hidden rounded-xl border border-dashed border-zinc-200 bg-zinc-50">
                {card.images && card.images.length > 0 ? (
                  <SlideshowImage images={card.images} alt={card.title} className={card.imageClass} />
                ) : card.image ? (
                  <img src={card.image} alt={card.title} className={card.imageClass ?? "absolute inset-0 w-full object-contain"} />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-sm text-zinc-300">
                    [ image placeholder ]
                  </div>
                )}
              </div>
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

        {/* CTA link */}
        {/*<div className="mt-12 text-center">
          <a
            href="https://mint.minibits.cash/Bitcoin/v1/info"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-6 py-3 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100"
          >
            View mint info
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
          </a>
        </div>*/}
      </div>
    </section>
  );
}
