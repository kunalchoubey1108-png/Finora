import { NextResponse } from "next/server";
import { conductVideoKYC } from "../../../../lib/agents";
import type { LeadProfile } from "../../../../lib/types";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const lead = body.lead as LeadProfile;
    const result = conductVideoKYC(lead);
    return NextResponse.json({ ok: true, result });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || String(err) },
      { status: 500 },
    );
  }
}
