import { NextResponse } from "next/server";

type NutMethod = {
  method: string;
  unit: string;
  min_amount?: number;
  max_amount?: number;
};

function methods(nut: unknown): NutMethod[] {
  const n = nut as { methods?: NutMethod[]; disabled?: boolean } | undefined;
  if (!n || n.disabled || !Array.isArray(n.methods)) return [];
  return n.methods.map(({ method, unit, min_amount, max_amount }) => ({
    method,
    unit,
    min_amount,
    max_amount,
  }));
}

export async function GET() {
  try {
    const res = await fetch("https://mint.minibits.cash/Bitcoin/v1/info", {
      next: { revalidate: 60 },
    });
    if (!res.ok) return NextResponse.json({ ok: false }, { status: 200 });
    const info = await res.json();
    return NextResponse.json(
      {
        ok: true,
        mint: methods(info?.nuts?.["4"]),
        melt: methods(info?.nuts?.["5"]),
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
