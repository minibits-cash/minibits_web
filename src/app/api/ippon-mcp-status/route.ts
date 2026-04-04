import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("https://ippon.minibits.cash/mcp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json, text/event-stream",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "initialize",
        params: {
          protocolVersion: "2024-11-05",
          capabilities: {},
          clientInfo: { name: "healthcheck", version: "1.0" },
        },
      }),
      next: { revalidate: 60 },
    });
    return NextResponse.json({ ok: res.ok }, { status: 200 });
  } catch {
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
