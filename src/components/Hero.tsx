"use client";

import { useEffect, useRef } from "react";

const STORE_LINKS = [
  {
    label: "Google Play",
    href: "https://play.google.com/store/apps/details?id=com.minibits_wallet",
    icon: (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-google-play" viewBox="0 0 16 16">
      <path d="M14.222 9.374c1.037-.61 1.037-2.137 0-2.748L11.528 5.04 8.32 8l3.207 2.96zm-3.595 2.116L7.583 8.68 1.03 14.73c.201 1.029 1.36 1.61 2.303 1.055zM1 13.396V2.603L6.846 8zM1.03 1.27l6.553 6.05 3.044-2.81L3.333.215C2.39-.341 1.231.24 1.03 1.27"/>
    </svg>
    ),
    bg: "bg-zinc-800 hover:bg-zinc-700",
    border: "border-zinc-700",
  },
  {
    label: "App Store",
    href: "https://apps.apple.com/us/app/minibits/id6744454479",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden>
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
      </svg>
    ),
    bg: "bg-zinc-800 hover:bg-zinc-700",
    border: "border-zinc-700",
  },
  {
    label: "FreedomStore",
    href: "https://freedomstore.io",
    icon: (
      <img src="https://cdn.prod.website-files.com/6841bdfe3384db0a2c1d4609/6846e718c00fc4c7e01bb21a_symbol.svg" alt="" aria-hidden className="h-4 w-4" style={{ filter: "grayscale(1) brightness(2)" }} />
    ),
    bg: "bg-zinc-800 hover:bg-zinc-700",
    border: "border-zinc-700",
  },
  {
    label: "Zapstore",
    href: "https://zapstore.dev/apps/com.minibits_wallet",
    icon: (
      <svg width="19" height="32" viewBox="0 0 19 32" fill="none" className="h-5 w-auto" aria-hidden>
        <path d="M18.8379 13.9711L8.84956 0.356086C8.30464 -0.386684 7.10438 0.128479 7.30103 1.02073L9.04686 8.94232C9.16268 9.46783 8.74887 9.96266 8.19641 9.9593L0.871032 9.91477C0.194934 9.91066 -0.223975 10.6293 0.126748 11.1916L7.69743 23.3297C7.99957 23.8141 7.73264 24.4447 7.16744 24.5816L5.40958 25.0076C4.70199 25.179 4.51727 26.0734 5.10186 26.4974L12.4572 31.8326C12.9554 32.194 13.6711 31.9411 13.8147 31.3529L15.8505 23.0152C16.0137 22.3465 15.3281 21.7801 14.6762 22.0452L13.0661 22.7001C12.5619 22.9052 11.991 22.6092 11.8849 22.0877L10.7521 16.5224C10.6486 16.014 11.038 15.5365 11.5704 15.5188L18.1639 15.2998C18.8529 15.2769 19.2383 14.517 18.8379 13.9711Z" fill="currentColor"/>
      </svg>
    ),
    bg: "bg-zinc-800 hover:bg-zinc-700",
    border: "border-zinc-700",
  },
];

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
              src="/videos/send_scan_token.mov"
              autoPlay
              loop
              muted
              playsInline
              className="h-[640px] w-auto rounded-2xl shadow-2xl"
            />
            <video
              ref={receiveVideoRef}
              src="/videos/receive_scan_token.mov"
              autoPlay
              loop
              muted
              playsInline
              className="h-[640px] w-auto rounded-2xl shadow-2xl"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
