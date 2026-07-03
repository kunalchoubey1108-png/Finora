import type {
  AuditRecord,
  GovernanceSummary,
  JourneyStageStatus,
  LeadProfile,
} from "./types";

export function createAuditRecord(
  step: string,
  decision: string,
  rationale: string,
  confidence: number,
  reviewRequired: boolean,
  assignedTo: string,
  notes: string,
): AuditRecord {
  return {
    id: `${step}-${Date.now()}`,
    step,
    decision,
    rationale,
    confidence,
    reviewRequired,
    assignedTo,
    notes,
    timestamp: new Date().toISOString(),
  };
}

export function determineGovernanceSummary(
  lead: LeadProfile,
  kycDecision: string,
): GovernanceSummary {
  const lowRisk = lead.score.complianceRisk <= 40;
  const requireOverride =
    lead.score.complianceRisk > 70 || kycDecision !== "Completed";
  const reviewLevel = requireOverride
    ? "Human Compliance Review"
    : "Auto-Approved with Monitoring";

  return {
    reviewLevel,
    riskNote: requireOverride
      ? "Elevated compliance risk with KYC exception routing and fraud signal present."
      : "Standard banking acquisition path with automated validation governance.",
    humanOverrideRequired: requireOverride,
    recommendedReviewer: requireOverride
      ? "Lead Compliance Officer"
      : "Governance Monitor",
    controlSignals: [
      `KYC confidence ${lead.score.onboardingConfidence}%`,
      `Compliance risk ${lead.score.complianceRisk}%`,
      `Segment policy ${lead.segment}`,
    ],
  };
}

export function createStageStatus(
  stage: string,
  status: JourneyStageStatus["status"],
  decisionSummary: string,
  confidence: number,
  governanceAction: string,
): JourneyStageStatus {
  return {
    stage,
    status,
    decisionSummary,
    confidence,
    governanceAction,
  };
}
