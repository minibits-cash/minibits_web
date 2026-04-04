import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("https://relay.minibits.cash", {
      headers: { Accept: "application/nostr+json" },
      next: { revalidate: 60 },
    });
    return NextResponse.json({ ok: res.ok }, { status: 200 });
  } catch {
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
