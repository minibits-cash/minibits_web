import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch(
      "https://minibits.cash/.well-known/nostr.json?name=minibits",
      { next: { revalidate: 60 } }
    );
    return NextResponse.json({ ok: res.ok }, { status: 200 });
  } catch {
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
