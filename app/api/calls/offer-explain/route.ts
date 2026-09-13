/**
 * POST /api/calls/offer-explain
 *
 * Agent 2 – Offer Explanation Agent
 * Triggered when a lead expressed interest in the outreach call.
 *
 * Body: { lead, offerResult, bankId, toPhone }
 * Returns: { ok, planId, runId, status, auditRecordId }
 */

import { NextRequest, NextResponse } from "next/server";
import type { LeadProfile, OfferPersonalizationResult } from "../../../../lib/types";
import { buildOfferExplainGoal } from "../../../../lib/callScriptEngine";
import { startCall } from "../../../../lib/calleClient";
import { createAuditRecord } from "../../../../lib/governance";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const lead: LeadProfile = body.lead;
    const offerResult: OfferPersonalizationResult = body.offerResult;
    const bankId: string = body.bankId ?? "default";
    const toPhone: string = body.toPhone;

    if (!toPhone || !lead?.id || !offerResult?.topOffers?.length) {
      return NextResponse.json(
        { ok: false, error: "toPhone, lead, and offerResult with topOffers are required" },
        { status: 400 }
      );
    }

    const goal = buildOfferExplainGoal(lead, offerResult, bankId);
    const run = await startCall({
      toPhone,
      goal,
      language: lead.preferredLanguage,
      region: lead.region ?? undefined,
    });

    const hasComplexOffers = offerResult.topOffers.some(
      (o) => o.policyStatus !== "policy-compliant"
    );

    const auditRecord = createAuditRecord(
      "CALL-E Offer Explanation",
      "Offer explanation call initiated",
      `Personalised offer call for ${lead.name} (${lead.id}). ` +
        `Top offer: "${offerResult.topOffers[0]?.name}". ` +
        `Governance disclosure required: ${hasComplexOffers}. ` +
        `run_id: ${run.run_id}`,
      lead.score.conversionProbability,
      hasComplexOffers,
      "calle-offer-agent",
      "",
    );

    return NextResponse.json({
      ok: true,
      planId: run.plan_id,
      runId: run.run_id,
      status: run.status,
      auditRecordId: auditRecord.id,
      governanceDisclosureRequired: hasComplexOffers,
      calleNextAction: run.next_action ?? null,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
