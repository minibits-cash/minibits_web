"use client";

import { useEffect, useRef } from "react";
import { STORE_LINKS } from "./storeLinks";

const GRANTS = [
  {
    name: "HRF Bitcoin Bounty",
    description: "Human Rights Foundation",
    color: "from-[#3680FA]/20 to-[#3680FA]/5",
    border: "border-[#3680FA]/30",
    icon: "🏆",
  },
  {
    name: "OpenSats Grantee",
    description: "Open-source Bitcoin funding",
    color: "from-[#ff6b01]/10 to-[#ffb200]/5",
    border: "border-[#ff6b01]/30",
    icon: (
      <svg viewBox="344.564 330.278 111.737 91.218" className="h-6 w-auto" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="os-a">
            <stop offset="0" style={{ stopColor: "#ffb200", stopOpacity: 1 }} />
            <stop offset="0.493" style={{ stopColor: "#ff6b01", stopOpacity: 1 }} />
          </linearGradient>
          <radialGradient href="#os-a" id="os-b" cx="31.833" cy="29.662" fx="31.833" fy="29.662" r="42.553" gradientTransform="matrix(2 0 0 1.99696 -74.45 12.982)" gradientUnits="userSpaceOnUse" />
        </defs>
        <path fill="url(#os-b)" d="M32.574 39.319v3.81h16.11v-3.81z" transform="translate(324.22 304.883) scale(2.39915)" />
        <path fill="url(#os-b)" d="M14.85 16.062v4.551l8.944 5.681v.137l-8.945 5.68v4.551l13.029-8.555v-3.49Z" transform="translate(324.22 304.883) scale(2.39915)" />
      </svg>
    ),
  },
];

export default function Hero() {
  const textOverlayRef = useRef<HTMLDivElement>(null);
  const receiveVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = receiveVideoRef.current;
    if (!video) return;
    // Pause immediately (overrides autoPlay), then start after delay
    video.pause();
    video.currentTime = 0;
    const timer = setTimeout(() => {
      video.play().catch(() => {});
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const textOverlay = textOverlayRef.current;
    if (!textOverlay) return;

    const cells = textOverlay.children;
    const plainText = "BITCOIN LIGHTNING ECASH PRIVATE INSTANT";
    const encryptedChars = "!@#$%^&*()_+-=[]{}|;:,.<>?";

    function getRandomChar(isEncrypted: boolean): string {
      if (isEncrypted)
        return encryptedChars[Math.floor(Math.random() * encryptedChars.length)];
      return plainText[Math.floor(Math.random() * plainText.length)];
    }

    function animateCell(cell: Element, delay: number) {
      setTimeout(() => {
        let isEncrypted = true;
        (cell as HTMLElement).style.opacity = "1";
        const intervalId = setInterval(() => {
          cell.textContent = getRandomChar(isEncrypted);
          if (Math.random() < 0.1) {
            isEncrypted = false;
            clearInterval(intervalId);
            cell.textContent = getRandomChar(false);
            setTimeout(() => {
              (cell as HTMLElement).style.opacity = "0";
            }, 2000);
          }
        }, 100);
      }, delay);
    }

    Array.from(cells).forEach((cell, index) => animateCell(cell, index * 50));

    const intervalId = setInterval(() => {
      Array.from(cells).forEach((cell, index) => {
        if (parseFloat((cell as HTMLElement).style.opacity) === 0) {
          animateCell(cell, index * 50);
        }
      });
    }, 5000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <section className="overflow-hidden bg-zinc-950 pt-16">
      <div className="animated-grid-bg relative min-h-screen w-full">
        {/* Colored glow areas */}
        {/*<div className="hero-glow-blue" />
        <div className="hero-glow-green" />*/}

        {/* Animated text grid */}
        <div className="text-overlay" ref={textOverlayRef}>
          {Array(600)
            .fill(null)
            .map((_, i) => (
              <div key={i} className="text-cell" />
            ))}
        </div>
        <div className="gradient-overlay" />

        {/* Bottom fade */}
        {/*<div className="pointer-events-none absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-zinc-950 to-transparent z-10" />*/}

        {/* Content */}
        <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-center px-6 pb-20 pt-12 lg:pt-0 lg:flex-row lg:items-center xl:px-8">
          {/* Left: text */}
          <div className="flex flex-col max-w-xl shrink-0">

            {/* Badge */}
            {/*<div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-zinc-700 bg-zinc-800/60 px-4 py-1.5 text-xs font-medium text-zinc-300 backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-[#599D52] animate-pulse" />
              Powered by Bitcoin · Cashu · Nostr
            </div>*/}

            <h1
              className="mb-6 text-5xl font-bold leading-tight text-zinc-100 sm:text-6xl lg:text-7xl"
              style={{ fontFamily: "var(--font-hammersmith)" }}
            >
              Instant.{" "}
              <span style={{ color: "#3680FA" }}>Private.</span>
              <br />
              <span style={{ color: "#599D52" }}>Ecash.</span>
            </h1>

            <p className="mb-10 max-w-xl text-lg font-normal leading-relaxed text-zinc-300 sm:text-xl">
              Minibits is a Bitcoin Lightning and ecash wallet plus related projects that deliver{" "}
              <strong className="text-zinc-100">instant, low-cost, and private</strong> value
              transfers — even when the payer is offline.
            </p>

            {/* App store buttons */}
            <div className="flex flex-wrap justify-center gap-3 mb-10">
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

            {/* Grant badges */}
            <p className="mb-8 max-w-xl text-lg text-zinc-300">
              Minibits is an open source project supported by:
            </p>
            <div className="mb-10 flex flex-wrap gap-3">
              {GRANTS.map((g) => (
                <div
                  key={g.name}
                  className={`flex items-center gap-3 rounded-xl border bg-gradient-to-r ${g.color} ${g.border} px-4 py-3 backdrop-blur-sm`}
                >
                  <span className="text-xl">{g.icon}</span>
                  <div>
                    <div className="text-sm font-semibold text-zinc-100">{g.name}</div>
                    <div className="text-xs text-zinc-400">{g.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: app videos */}
          <div className="hidden shrink-0 lg:flex lg:items-center ml-auto [&>video+video]:-ml-20">
            <video
              autoPlay
              loop
              muted
              playsInline
              className="h-[640px] w-auto rounded-2xl shadow-2xl"
            >
              <source src="/videos/send_scan_token.mov" type="video/quicktime" />
              <source src="/videos/send_scan_token.mp4" type="video/mp4" />
            </video>
            <video
              ref={receiveVideoRef}
              autoPlay
              loop
              muted
              playsInline
              className="h-[640px] w-auto rounded-2xl shadow-2xl"
            >
              <source src="/videos/receive_scan_token.mov" type="video/quicktime" />
              <source src="/videos/receive_scan_token.mp4" type="video/mp4" />
            </video>
          </div>
        </div>
      </div>
    </section>
  );
}
