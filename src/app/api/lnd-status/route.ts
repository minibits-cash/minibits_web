import { NextResponse } from "next/server";
import https from "node:https";

// Reached over the container bridge network with a macaroon, so it must never
// be prerendered at build time or cached by the framework.
export const dynamic = "force-dynamic";

const CACHE_TTL_MS = 60_000;
const REQUEST_TIMEOUT_MS = 5_000;

let cached: { ok: boolean; at: number } | null = null;

function getInfo(): Promise<boolean> {
  const host = process.env.LND_REST_HOST;
  const macaroon = process.env.LND_MACAROON_HEX;

  if (!host || !macaroon) {
    return Promise.resolve(false);
  }

  const cert = process.env.LND_TLS_CERT_B64;

  return new Promise((resolve) => {
    const req = https.request(
      {
        host,
        port: Number(process.env.LND_REST_PORT ?? 8080),
        path: "/v1/getinfo",
        method: "GET",
        headers: { "Grpc-Metadata-macaroon": macaroon },
        // lnd's cert is self-signed and issued for its own hostname, not for
        // the bridge IP we dial, so verify against the pinned cert when we
        // have one and skip the hostname check either way.
        ca: cert ? Buffer.from(cert, "base64") : undefined,
        rejectUnauthorized: Boolean(cert),
        checkServerIdentity: () => undefined,
        timeout: REQUEST_TIMEOUT_MS,
      },
      (res) => {
        res.resume();
        resolve(res.statusCode === 200);
      }
    );
    req.on("timeout", () => req.destroy());
    req.on("error", () => resolve(false));
    req.end();
  });
}

export async function GET() {
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
    return NextResponse.json({ ok: cached.ok }, { status: 200 });
  }

  const ok = await getInfo();
  cached = { ok, at: Date.now() };
  return NextResponse.json({ ok }, { status: 200 });
}
