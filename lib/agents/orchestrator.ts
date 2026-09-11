import { syntheticLeads } from "../../data/leads";
import {
  conductVideoKYC,
  determinePrimarySegment,
  explainLeadPriority,
  makeAcquisitionStrategy,
  optimizeCampaign,
  personalizeCommunication,
  recommendOffer,
  scoreLead,
} from "../agents";
import { createAuditRecord, determineGovernanceSummary } from "../governance";
import type {
  AcquisitionReport,
  AgentExecutionResult,
  AgentFlowReport,
  LeadProfile,
  StageStatus,
} from "../types";

function makeAuditId(agentName: string, leadId: string) {
  return `audit-${agentName.toLowerCase().replace(/\s+/g, "-")}-${leadId}`;
}

function buildAgentResult(
  agentName: string,
  input: Record<string, unknown>,
  output: Record<string, unknown>,
  confidence: number,
  decision: string,
  escalated: boolean,
  reasoningSummary: string,
  leadId: string,
): AgentExecutionResult {
  return {
    agentName,
    input,
    output,
    confidence,
    decision,
    escalated,
    reasoningSummary,
    auditLogId: makeAuditId(agentName, leadId),
    status: escalated ? "Escalated" : "Completed",
    timestamp: new Date().toISOString(),
  };
}

function chooseLead(leadId?: string): LeadProfile {
  const scoredLeads = syntheticLeads.map(scoreLead);
  if (leadId) {
    const lead = scoredLeads.find((item) => item.id === leadId);
    if (lead) return lead;
  }
  return scoredLeads.sort(
    (a, b) => b.score.businessValue - a.score.businessValue,
  )[0];
}

export function runAgentOrchestration(leadId?: string, bankId?: string): AgentFlowReport {
  const selectedLead = chooseLead(leadId);
  const scoredLead = scoreLead(selectedLead);
  const primarySegment = determinePrimarySegment([scoredLead]);

  const startTime = new Date();
  const agentResults: AgentExecutionResult[] = [];

  const scoringOutput = {
    businessValue: scoredLead.score.businessValue,
    complianceRisk: scoredLead.score.complianceRisk,
    productFit: scoredLead.score.productFit,
    decisionGrade: scoredLead.score.decisionGrade,
  };
  agentResults.push(
    buildAgentResult(
      "Lead Scoring Agent",
      { leadId: scoredLead.id, segment: scoredLead.segment },
      scoringOutput,
      scoredLead.score.confidence,
      "Lead selected for acquisition journey.",
      scoredLead.score.complianceRisk >= 65,
      "Ranked the primary candidate by business value, compliance risk and digital maturity.",
      scoredLead.id,
    ),
  );

  const strategy = makeAcquisitionStrategy([scoredLead]);
  agentResults.push(
    buildAgentResult(
      "Strategy Agent",
      {
        leadSegment: scoredLead.segment,
        complianceRisk: scoredLead.score.complianceRisk,
        productFit: scoredLead.score.productFit,
      },
      strategy,
      88,
      "Defined a governance-aware acquisition plan.",
      strategy.governanceControl.includes("compliance"),
      strategy.rationale,
      scoredLead.id,
    ),
  );

  const campaign = optimizeCampaign(strategy, [scoredLead], bankId);
  agentResults.push(
    buildAgentResult(
      "Campaign Optimization Agent",
      {
        planName: strategy.planName,
        primaryChannel: strategy.primaryChannel,
      },
      campaign,
      86,
      "Optimized campaign targeting and asset strategy.",
      false,
      campaign.governanceNotes,
      scoredLead.id,
    ),
  );

  const personalization = personalizeCommunication(scoredLead, bankId);
  agentResults.push(
    buildAgentResult(
      "Personalization Agent",
      {
        leadId: scoredLead.id,
        preferredLanguage: scoredLead.preferredLanguage,
        persona: scoredLead.persona.archetype,
      },
      personalization,
      92,
      "Created localized, compliance-safe customer messaging.",
      false,
      personalization.audienceSynopsis,
      scoredLead.id,
    ),
  );

  const offer = recommendOffer(scoredLead, bankId);
  const offerEscalated =
    offer.governanceLabel.includes("Manual review") ||
    offer.governanceLabel.includes("Enhanced review");
  agentResults.push(
    buildAgentResult(
      "Offer Recommendation Agent",
      {
        leadSegment: scoredLead.segment,
        productFit: scoredLead.score.productFit,
      },
      offer,
      87,
      `Recommended ${offer.recommendation}.`,
      offerEscalated,
      offer.rationale,
      scoredLead.id,
    ),
  );

  const onboarding = conductVideoKYC(scoredLead);
  const onBoardEscalation = onboarding.status !== "Completed";
  agentResults.push(
    buildAgentResult(
      "Video KYC Agent",
      {
        onboardingConfidence: scoredLead.score.onboardingConfidence,
        complianceRisk: scoredLead.score.complianceRisk,
      },
      onboarding,
      scoredLead.score.onboardingConfidence,
      `Video KYC result: ${onboarding.status}.`,
      onBoardEscalation,
      onboarding.verificationDetails,
      scoredLead.id,
    ),
  );

  const governance = determineGovernanceSummary(scoredLead, onboarding.status);
  agentResults.push(
    buildAgentResult(
      "Governance Review Agent",
      {
        complianceRisk: scoredLead.score.complianceRisk,
        onboardingStatus: onboarding.status,
      },
      governance,
      90,
      governance.humanOverrideRequired
        ? "Governance review recommended."
        : "Governance checks passed.",
      governance.humanOverrideRequired,
      governance.riskNote,
      scoredLead.id,
    ),
  );

  const auditLog: AcquisitionReport["auditLog"] = agentResults.map((result) =>
    createAuditRecord(
      result.agentName,
      result.decision,
      result.reasoningSummary,
      result.confidence,
      result.escalated,
      result.agentName.includes("KYC")
        ? "KYC Operations"
        : result.agentName.includes("Governance")
          ? "Compliance Team"
          : "Acquisition Ops",
      result.escalated
        ? "Escalation path documented for governance or security review."
        : "Decision recorded for audit traceability.",
    ),
  );

  const stageStatuses = agentResults.map((result) => ({
    stage: result.agentName,
    status: (result.status === "Escalated"
      ? "Review Required"
      : result.status) as StageStatus,
    decisionSummary: result.decision,
    confidence: result.confidence,
    governanceAction:
      result.agentName === "Strategy Agent"
        ? strategy.governanceControl
        : result.agentName === "Campaign Optimization Agent"
          ? campaign.governanceNotes
          : result.agentName === "Offer Recommendation Agent"
            ? offer.governanceLabel
            : result.agentName === "Video KYC Agent"
              ? onboarding.manualReviewPath
              : result.agentName === "Governance Review Agent"
                ? governance.controlSignals.join(" | ")
                : result.reasoningSummary,
  }));

  const journeyState: AcquisitionReport["journeyState"] = {
    currentStage: agentResults[agentResults.length - 1].agentName,
    completedStages: agentResults.length,
    totalStages: agentResults.length,
    humanActionRequired: governance.humanOverrideRequired,
  };

  const flowReport: AgentFlowReport = {
    selectedLeadId: scoredLead.id,
    selectedLeadName: scoredLead.name,
    selectedLeadSegment: scoredLead.segment,
    outcomeSummary: `Governance-first agent orchestration completed for ${scoredLead.name} with offer ${offer.recommendation}.`,
    primarySegment,
    leads: [scoredLead],
    strategy,
    campaign,
    personalization,
    offer,
    onboarding,
    governance,
    auditLog,
    stageStatuses,
    timeline: agentResults.map((result) => ({
      step: result.agentName,
      detail: result.decision,
    })),
    journeyState,
    executionId: `flow-${scoredLead.id}-${startTime.getTime()}`,
    startedAt: startTime.toISOString(),
    finishedAt: new Date().toISOString(),
    agentResults,
  };

  return flowReport;
}
