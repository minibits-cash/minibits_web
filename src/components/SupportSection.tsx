import React from "react";

const SUPPORT_LINKS = [
  {
    title: "Learn about Cashu ecash",
    description:
      "Cashu is an open-source, privacy-preserving ecash protocol built on Bitcoin. Explore the documentation, specs, and ecosystem.",
    href: "https://cashu.space",
    cta: "I want to know more about Cashu ecash",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
      </svg>
    ),
    accent: "text-[#3680FA] bg-[#3680FA]/10 border-[#3680FA]/20",
    ctaStyle: "text-[#3680FA] hover:text-[#3680FA]/80",
  },
  {
    title: "Recover your ecash, faster",
    description:
      "Lost access to your Minibits wallet? The Minibits Recovery service lets you restore your ecash balance from a 12-word seed phrase — optimized for speed and privacy.",
    href: "https://recovery.minibits.cash",
    cta: "Recover your ecash, faster",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
      </svg>
    ),
    accent: "text-[#599D52] bg-[#599D52]/10 border-[#599D52]/20",
    ctaStyle: "text-[#599D52] hover:text-[#599D52]/80",
  },
  {
    title: "Get support",
    description:
      "Running into an issue with Minibits wallet? Our support team is ready to help. Reach out and we'll get back to you as soon as possible.",
    href: "mailto:support@minibits.cash",
    cta: "Another Minibits issue",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
      </svg>
    ),
    accent: "text-[#f18805] bg-[#f18805]/10 border-[#f18805]/20",
    ctaStyle: "text-[#f18805] hover:text-[#f18805]/80",
  },
];

export default function SupportSection() {
  return (
    <section id="support" className="bg-zinc-50 py-24">
      <div className="mx-auto max-w-7xl px-6 xl:px-8">
        {/* Section header */}
        <div className="mb-16 max-w-2xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-1.5 text-xs font-medium text-zinc-500">
            💬 Support &amp; Resources
          </div>
          <h2 className="mb-4 text-4xl font-bold text-zinc-900 sm:text-5xl">
            We&apos;re here to help
          </h2>
          <p className="text-lg text-zinc-600">
            Whether you&apos;re new to Cashu ecash or need assistance with the wallet, we have resources to
            get you sorted.
          </p>
        </div>

        {/* Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {SUPPORT_LINKS.map((item) => (
            <div
              key={item.title}
              className="group flex flex-col rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              {/* Image/video placeholder */}
              <div className="mb-5 flex h-40 w-full items-center justify-center rounded-xl border border-dashed border-zinc-200 bg-zinc-50 text-zinc-300 text-sm">
                [ image placeholder ]
              </div>

              {/* Icon */}
              <div className={`mb-4 inline-flex w-fit rounded-xl border p-3 ${item.accent}`}>
                {item.icon}
              </div>

              <h3 className="mb-2 text-lg font-semibold text-zinc-900">{item.title}</h3>
              <p className="mb-6 flex-1 text-sm leading-relaxed text-zinc-600">{item.description}</p>

              <a
                href={item.href}
                target={item.href.startsWith("mailto") ? undefined : "_blank"}
                rel={item.href.startsWith("mailto") ? undefined : "noopener noreferrer"}
                className={`inline-flex items-center gap-2 text-sm font-semibold transition-colors ${item.ctaStyle}`}
              >
                {item.cta}
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
