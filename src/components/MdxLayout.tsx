import React from "react";
import Link from "next/link";
import Image from "next/image";

export default function MdxLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Minimal header */}
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 xl:px-8">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/icon-192.png" alt="Minibits" width={28} height={28} className="rounded-lg" />
            <span
              className="text-xl leading-none text-zinc-900"
              style={{ fontFamily: "var(--font-hammersmith)" }}
            >
              minibits<span style={{ color: "#599D52" }}>.</span>
              <span className="text-zinc-400 text-sm">cash</span>
            </span>
          </Link>
          <Link href="/" className="text-sm text-zinc-500 transition hover:text-zinc-800">
            ← Back to home
          </Link>
        </div>
      </header>

      <main className="bg-white px-6 py-16 xl:px-8">
        <article className="prose-minibits mx-auto">{children}</article>
      </main>

      {/* Minimal footer */}
      <footer className="border-t border-zinc-100 bg-zinc-50 px-6 py-8 text-center text-xs text-zinc-400 xl:px-8">
        <p>© {new Date().getFullYear()} Bitango Technologies, s.r.o.</p>
        <div className="mt-2 flex justify-center gap-4">
          <Link href="/privacy" className="hover:text-zinc-600">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-zinc-600">Terms &amp; Conditions</Link>
        </div>
      </footer>
    </>
  );
}
