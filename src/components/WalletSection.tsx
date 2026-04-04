"use client";

import { useEffect, useState } from "react";
import SlideshowImage from "./SlideshowImage";

type Status = "loading" | "operational" | "unavailable";

function StatusDot({ status }: { status: Status }) {
  const colors: Record<Status, string> = {
    loading: "bg-yellow-400",
    operational: "bg-green-400",
    unavailable: "bg-red-500",
  };
  const labels: Record<Status, string> = {
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

type WalletCard = {
  title: string;
  description: string;
  link?: { label: string; href: string };
  video?: string;
  image?: string;
  images?: string[];
  imageClass?: string;
};

const WALLET_CARDS: WalletCard[] = [
  {
    title: "Free Lightning Address",
    description:
      "Get a human-readable Lightning address instantly — no sign-up or KYC required.",
    link: { label: "Learn about Lightning addresses", href: "https://lightningaddress.com" },
    image: "/img/lightning_address.jpg",
  },
  {
    title: "Nostr Wallet Connect & Zaps",
    description:
      "Built-in NWC lets you send tips (called zaps) on Nostr social networks straight from your wallet.",
    link: { label: "Nostr Wallet Connect spec", href: "https://nwc.dev" },
    video: "/videos/nwc_zap.mp4",
  },
  {
    title: "Tap-to-Pay with NFC",
    description:
      "True tap-to-pay experience using NFC, even between two Minibits devices. Compatible with Numo payment terminal.",
    link: { label: "Numo terminal", href: "https://numopay.org" },
    video: "/videos/pay_with_nfc.mp4",
  },
];

export default function WalletSection() {
  const [addressServerStatus, setAddressServerStatus] = useState<Status>("loading");
  const [relayStatus, setRelayStatus] = useState<Status>("loading");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/address-server-status")
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setAddressServerStatus(data.ok ? "operational" : "unavailable");
      })
      .catch(() => {
        if (!cancelled) setAddressServerStatus("unavailable");
      });
    fetch("/api/relay-status")
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setRelayStatus(data.ok ? "operational" : "unavailable");
      })
      .catch(() => {
        if (!cancelled) setRelayStatus("unavailable");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section id="wallet" className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-6 xl:px-8">
        {/* Header */}
        <div className="mb-16 max-w-3xl">
          <h2 className="mb-4 text-4xl font-bold text-zinc-900 sm:text-5xl">
            Minibits Wallet
          </h2>
          <p className="text-lg leading-relaxed text-zinc-600">
            Minibits wallet provides you with a free Lightning address, and with Nostr Wallet
            Connect built in, it&apos;s perfect for sending small tips—known as &quot;zaps&quot;—on
            Nostr social networks. More, Minibits delivers true Tap-to-pay experience to
            Bitcoin, combining ecash with NFC - even if payer remains offline.
          </p>

          {/* Status indicator */}
          <div className="mt-6 inline-flex items-center gap-3 rounded-xl border border-zinc-200 bg-zinc-50 px-5 py-3">
            <span className="text-sm text-zinc-500 font-medium">minibits.cash</span>
            <span className="text-zinc-300">·</span>
            <span className="text-xs text-zinc-400">Address server</span>
            <StatusDot status={addressServerStatus} />
            <span className="text-zinc-300">·</span>
            <span className="text-xs text-zinc-400">Nostr relay</span>
            <StatusDot status={relayStatus} />
          </div>
        </div>

        {/* Feature cards */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {WALLET_CARDS.map((card) => (
            <div
              key={card.title}
              className="group flex flex-col rounded-2xl border border-zinc-200 bg-zinc-50 p-8"
            >
              {/* Media */}
              <div className="mb-6 flex h-45 w-full overflow-hidden rounded-xl bg-zinc-200">
                {card.video ? (
                  <video
                    src={card.video}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full object-cover"
                  />
                ) : card.images && card.images.length > 0 ? (
                  <SlideshowImage images={card.images} alt={card.title} className={card.imageClass} />
                ) : card.image ? (
                  <img src={card.image} alt={card.title} className={card.imageClass ?? "w-full object-cover"} />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sm text-zinc-400">
                    [ image placeholder ]
                  </div>
                )}
              </div>
              <h3 className="mb-2 text-lg font-semibold text-zinc-900">{card.title}</h3>
              <p className="text-sm leading-relaxed text-zinc-600">{card.description}</p>
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
      </div>
    </section>
  );
}
