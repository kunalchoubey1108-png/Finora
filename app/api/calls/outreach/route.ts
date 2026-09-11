/**
 * POST /api/calls/outreach
 *
 * Agent 1 – Lead Outreach Agent
 * Triggered after scoreLead() returns conversionProbability >= 70.
 *
 * Body: { lead: LeadProfile, bankId: string }
 * Returns: { ok: true, planId, runId, status } | { ok: false, error }
 */

import { NextRequest, NextResponse } from "next/server";
import type { LeadProfile } from "../../../../lib/types";
import { buildOutreachGoal } from "../../../../lib/callScriptEngine";
import { startCall } from "../../../../lib/calleClient";
import { createAuditRecord } from "../../../../lib/governance";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const lead: LeadProfile = body.lead;
    const bankId: string = body.bankId ?? "default";
    const toPhone: string = body.toPhone; // caller supplies the lead's phone number

    if (!toPhone) {
      return NextResponse.json({ ok: false, error: "toPhone is required" }, { status: 400 });
    }

    if (!lead?.id) {
      return NextResponse.json({ ok: false, error: "lead is required" }, { status: 400 });
    }

    // Only call high-conversion leads
    if ((lead.score?.conversionProbability ?? 0) < 70) {
      return NextResponse.json({
        ok: false,
        error: "Lead conversionProbability below threshold (70). Call not placed.",
      });
    }

    const goal = buildOutreachGoal(lead, bankId);
    const run = startCall({
      toPhone,
      goal,
      language: lead.preferredLanguage,
      region: lead.region ?? undefined,
    });

    // Append to audit trail
    const auditRecord = createAuditRecord(
      "CALL-E Lead Outreach",
      "Call initiated",
      `Outbound outreach call placed for lead ${lead.name} (${lead.id}) via CALL-E. run_id: ${run.run_id}`,
      lead.score.conversionProbability,
      false,
      "calle-outreach-agent",
      "",
    );

    return NextResponse.json({
      ok: true,
      planId: run.plan_id,
      runId: run.run_id,
      status: run.status,
      auditRecordId: auditRecord.id,
      calleNextAction: run.next_action ?? null,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
