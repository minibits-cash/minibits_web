import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("https://mint.minibits.cash/lnd/getinfo", {
      next: { revalidate: 60 },
    });
    return NextResponse.json({ ok: res.ok }, { status: 200 });
  } catch {
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
