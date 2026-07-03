import { NextResponse } from "next/server";
import { createAuditRecord } from "../../../../lib/governance";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sessionId, decision, reviewer, notes } = body;

    const audit = createAuditRecord(
      `KYC Review ${sessionId}`,
      decision,
      notes || "Reviewer action recorded",
      85,
      decision !== "approved",
      reviewer || "KYC Reviewer",
      `Reviewer decision: ${decision}`,
    );

    return NextResponse.json({ ok: true, audit });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || String(err) },
      { status: 500 },
    );
  }
}
