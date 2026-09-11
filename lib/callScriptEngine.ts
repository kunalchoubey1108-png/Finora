/**
 * lib/callScriptEngine.ts
 *
 * Renders natural-language call goal scripts from LeadProfile,
 * OfferPersonalizationResult, and OnboardingResult.
 * The rendered string is passed directly to CALL-E as the `goal`.
 */

import type { LeadProfile, OfferPersonalizationResult, OnboardingResult } from "./types";
import { getBankConfig } from "./bankRegistry";

// ─────────────────────────────────────────────
// Agent 1 – Lead Outreach Script
// ─────────────────────────────────────────────
export function buildOutreachGoal(lead: LeadProfile, bankId: string): string {
  const bank = getBankConfig(bankId);
  const bankName = bank?.name ?? "the bank";
  return (
    `You are a friendly, professional banking relationship manager calling on behalf of ${bankName}. ` +
    `Your goal is to introduce ${bankName} to ${lead.name} in ${lead.city}. ` +
    `The customer's main motivation is: ${lead.persona.motivation}. ` +
    `They belong to the '${lead.segment}' customer segment. ` +
    `Their key challenge is: ${lead.challengeSummary}. ` +
    `Speak in ${lead.preferredLanguage}. ` +
    `Do NOT pitch any product yet — only introduce yourself, ask if they have 2 minutes, ` +
    `and find out whether they are open to hearing about tailored banking solutions. ` +
    `Capture their interest level: interested, not interested, or prefer callback. ` +
    `If callback, ask for their preferred time. ` +
    `Always be respectful, concise, and end the call politely.`
  );
}

// ─────────────────────────────────────────────
// Agent 2 – Offer Explanation Script
// ─────────────────────────────────────────────
export function buildOfferExplainGoal(
  lead: LeadProfile,
  offerResult: OfferPersonalizationResult,
  bankId: string
): string {
  const bank = getBankConfig(bankId);
  const bankName = bank?.name ?? "the bank";
  const topOffers = offerResult.topOffers.slice(0, 3);

  const offerLines = topOffers
    .map(
      (o, i) =>
        `Offer ${i + 1}: "${o.name}" — ${o.description} ` +
        `Benefits focus: ${o.benefitsTheme}. Why it fits: ${o.whyThisOffer}.`
    )
    .join(" | ");

  const policyNote = topOffers.some((o) => o.policyStatus !== "policy-compliant")
    ? `IMPORTANT: Before presenting any offer, read this compliance disclosure aloud: ` +
      `"Please note that some products may require additional verification by our compliance team. ` +
      `Your data is processed securely and in accordance with applicable regulations." `
    : "";

  return (
    `You are a ${bankName} banking advisor calling ${lead.name} in ${lead.city} ` +
    `for a follow-up conversation they agreed to. ` +
    `Speak in ${lead.preferredLanguage}. ` +
    `${policyNote}` +
    `Present the following personalised offers one by one: ${offerLines}. ` +
    `Handle objections naturally — if they say they already have a savings account, explain the bundle complements it. ` +
    `If they ask about fees, say there are no annual fees for the first year. ` +
    `If they are unsure, offer to send a WhatsApp summary. ` +
    `If they agree to an offer, confirm which one verbally and say their digital KYC process will be initiated. ` +
    `Record the chosen offer name and whether consent was verbally given. ` +
    `Always close politely and professionally.`
  );
}

// ─────────────────────────────────────────────
// Agent 3 – Customer Support Script
// ─────────────────────────────────────────────
export function buildSupportGoal(
  lead: LeadProfile,
  onboarding: OnboardingResult,
  bankId: string
): string {
  const bank = getBankConfig(bankId);
  const bankName = bank?.name ?? "the bank";

  const kycStatus = onboarding.status;
  const verificationDetails = onboarding.verificationDetails ?? "no additional details available";
  const sessionId = onboarding.sessionId ?? "N/A";

  return (
    `You are a ${bankName} customer support specialist calling ${lead.name}. ` +
    `Speak in ${lead.preferredLanguage}. ` +
    `Their KYC application status is: "${kycStatus}". ` +
    `Verification details: "${verificationDetails}". ` +
    `Their session reference is: ${sessionId}. ` +
    `Your goals: ` +
    `1) Greet them and ask how you can help. ` +
    `2) Answer questions about their KYC status, the verification process, or their offer. ` +
    `3) If they ask why an offer was not shown, explain eligibility criteria politely. ` +
    `4) If they raise a complaint or you cannot resolve in 3 attempts, tell them you are escalating ` +
    `and that a specialist will call back within 4 business hours. ` +
    `5) Record the query topics, resolution status, and any escalation reason. ` +
    `Always be empathetic, clear, and professional. Do not make promises beyond what is stated above.`
  );
}
