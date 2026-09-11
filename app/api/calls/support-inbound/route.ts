/**
 * POST /api/calls/support-inbound
 *
 * Agent 3 – Customer Support Agent
 * Triggered by a support query event or callback request.
 *
 * Body: { lead, onboarding, bankId, toPhone }
 * Returns: { ok, planId, runId, status, auditRecordId }
 */

import { NextRequest, NextResponse } from "next/server";
import type { LeadProfile, OnboardingResult } from "../../../../lib/types";
import { buildSupportGoal } from "../../../../lib/callScriptEngine";
import { startCall } from "../../../../lib/calleClient";
import { createAuditRecord } from "../../../../lib/governance";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const lead: LeadProfile = body.lead;
    const onboarding: OnboardingResult = body.onboarding;
    const bankId: string = body.bankId ?? "default";
    const toPhone: string = body.toPhone;

    if (!toPhone || !lead?.id || !onboarding) {
      return NextResponse.json(
        { ok: false, error: "toPhone, lead, and onboarding are required" },
        { status: 400 }
      );
    }

    const goal = buildSupportGoal(lead, onboarding, bankId);
    const run = startCall({
      toPhone,
      goal,
      language: lead.preferredLanguage,
      region: lead.region ?? undefined,
    });

    const auditRecord = createAuditRecord(
      "CALL-E Customer Support",
      "Support callback call initiated",
      `Support call for ${lead.name} (${lead.id}). ` +
        `KYC status: ${onboarding.status}. Session: ${onboarding.sessionId ?? "N/A"}. ` +
        `run_id: ${run.run_id}`,
      100,
      onboarding.status === "Manual Review" || onboarding.status === "Exception Routed",
      "calle-support-agent",
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
