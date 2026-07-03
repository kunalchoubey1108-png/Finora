import type { AgentExecutionResult, LeadProfile } from "./types";

/**
 * Policy rules engine for governance decisions
 */
export const policyRules = {
  // Confidence thresholds
  minScoringConfidence: 80,
  minOfferConfidence: 85,
  minKYCConfidence: 90,

  // Risk thresholds
  maxAllowedComplianceRisk: 65,
  escalationComplianceRisk: 70,
  criticalComplianceRisk: 80,

  // Segment-based rules
  segmentPolicies: {
    "Premium Emerging": {
      requiresManualReview: true,
      requiresAdvisorHandoff: true,
      minBudget: 50000,
    },
    "SME Catalyst": {
      requiresEnhancedKYC: true,
      requiresBusinessValidation: true,
      minBudget: 25000,
    },
    "Wealth Builder": {
      requiresManualReview: true,
      requiresComplianceSignOff: true,
      minBudget: 75000,
    },
    "Urban Growth": {
      autoApproveBelow: 100000,
      requiresMonitoring: true,
      minBudget: 15000,
    },
    "Digital Saver": {
      autoApproveBelow: 80000,
      requiresMonitoring: true,
      minBudget: 10000,
    },
  },

  // Consent requirements
  consentRequirements: {
    videoKYC: [
      "Biometric consent",
      "Data privacy acknowledgment",
      "Identity verification consent",
    ],
    offersAndMarketing: [
      "Marketing consent",
      "SMS/Email preference",
      "Data retention policy",
    ],
    creditProducts: [
      "Creditworthiness acknowledgment",
      "Co-applicant consent if applicable",
    ],
  },

  // Fairness checks
  fairnessFlags: {
    ageDiscrimination: (age: number) => age > 60 || age < 18,
    incomeVsProductFit: (income: number, productFit: number) =>
      income < 100000 && productFit > 85, // Income too low for high-fit product
    geographicBias: (city: string, segment: string) => {
      const metropolitanCities = ["Mumbai", "Delhi", "Bangalore", "Chennai"];
      return (
        !metropolitanCities.includes(city) && segment === "Premium Emerging"
      );
    },
  },
};

export type GovernanceCheckResult = {
  passesBasicThreshold: boolean;
  needsManualReview: boolean;
  requiresEscalation: boolean;
  fairnessWarnings: string[];
  consentGaps: string[];
  policyViolations: string[];
  recommendedReviewer: string;
  riskSeverity: "Low" | "Moderate" | "Elevated" | "Critical";
};

/**
 * Governance Agent: Evaluates all decisions against policy rules
 */
export function runGovernanceCheck(
  lead: LeadProfile,
  agentResults: AgentExecutionResult[],
  offerConfidence: number,
  kycStatus: string,
): GovernanceCheckResult {
  const policyViolations: string[] = [];
  const fairnessWarnings: string[] = [];
  const consentGaps: string[] = [];

  // Check confidence thresholds
  const scoringResult = agentResults.find((r) =>
    r.agentName.includes("Scoring"),
  );
  const offerResult = agentResults.find((r) => r.agentName.includes("Offer"));
  const kycResult = agentResults.find((r) => r.agentName.includes("KYC"));

  if (
    scoringResult &&
    scoringResult.confidence < policyRules.minScoringConfidence
  ) {
    policyViolations.push(
      `Scoring confidence ${scoringResult.confidence}% below minimum ${policyRules.minScoringConfidence}%`,
    );
  }

  if (offerConfidence < policyRules.minOfferConfidence) {
    policyViolations.push(
      `Offer confidence ${offerConfidence}% below minimum ${policyRules.minOfferConfidence}%`,
    );
  }

  if (kycResult && kycResult.confidence < policyRules.minKYCConfidence) {
    policyViolations.push(
      `KYC confidence ${kycResult.confidence}% below minimum ${policyRules.minKYCConfidence}%`,
    );
  }

  // Check compliance risk thresholds
  if (lead.score.complianceRisk > policyRules.criticalComplianceRisk) {
    policyViolations.push(
      `CRITICAL: Compliance risk ${lead.score.complianceRisk}% exceeds maximum ${policyRules.criticalComplianceRisk}%`,
    );
  } else if (lead.score.complianceRisk > policyRules.escalationComplianceRisk) {
    policyViolations.push(
      `Compliance risk ${lead.score.complianceRisk}% requires escalation (threshold: ${policyRules.escalationComplianceRisk}%)`,
    );
  }

  // Check segment-specific policies
  const segmentPolicy = policyRules.segmentPolicies[lead.segment];
  if (
    segmentPolicy &&
    "requiresManualReview" in segmentPolicy &&
    segmentPolicy.requiresManualReview
  ) {
    policyViolations.push(
      `Segment policy: ${lead.segment} requires manual review for all offers`,
    );
  }
  if (
    segmentPolicy &&
    "requiresEnhancedKYC" in segmentPolicy &&
    segmentPolicy.requiresEnhancedKYC &&
    kycStatus !== "Completed"
  ) {
    policyViolations.push(
      `Segment policy: ${lead.segment} requires enhanced KYC validation`,
    );
  }

  // Fairness checks
  if (policyRules.fairnessFlags.ageDiscrimination(lead.age)) {
    fairnessWarnings.push(
      `Age flag: Lead age ${lead.age} may trigger fairness review`,
    );
  }
  if (
    policyRules.fairnessFlags.incomeVsProductFit(
      lead.income,
      lead.score.productFit,
    )
  ) {
    fairnessWarnings.push(
      `Income mismatch: High product-fit recommendation for relatively lower-income lead`,
    );
  }
  if (policyRules.fairnessFlags.geographicBias(lead.city, lead.segment)) {
    fairnessWarnings.push(
      `Geographic distribution: Premium segment heavily skewed to metro cities`,
    );
  }

  // Consent gaps
  if (!lead.governanceFlags.includes("Biometric consent")) {
    consentGaps.push("Biometric consent for Video KYC not yet obtained");
  }
  if (!lead.governanceFlags.includes("Marketing consent")) {
    consentGaps.push("Marketing communication consent not obtained");
  }

  // Determine risk severity
  let riskSeverity: "Low" | "Moderate" | "Elevated" | "Critical" = "Low";
  if (lead.score.complianceRisk > policyRules.criticalComplianceRisk) {
    riskSeverity = "Critical";
  } else if (lead.score.complianceRisk > policyRules.escalationComplianceRisk) {
    riskSeverity = "Elevated";
  } else if (lead.score.complianceRisk > policyRules.maxAllowedComplianceRisk) {
    riskSeverity = "Moderate";
  }

  // Determine review requirements
  const needsManualReview =
    policyViolations.length > 0 ||
    fairnessWarnings.length > 2 ||
    lead.score.businessValue < 100000;
  const requiresEscalation =
    riskSeverity === "Critical" ||
    lead.score.complianceRisk > policyRules.escalationComplianceRisk;

  const recommendedReviewer =
    riskSeverity === "Critical"
      ? "Chief Compliance Officer"
      : riskSeverity === "Elevated"
        ? "Senior Compliance Manager"
        : "Governance Analyst";

  return {
    passesBasicThreshold: policyViolations.length === 0,
    needsManualReview,
    requiresEscalation,
    fairnessWarnings,
    consentGaps,
    policyViolations,
    recommendedReviewer,
    riskSeverity,
  };
}

/**
 * Generate governance dashboard metrics
 */
export type GovernanceDashboardMetrics = {
  totalDecisions: number;
  autoApprovedCount: number;
  manualReviewCount: number;
  escalatedCount: number;
  overriddenCount: number;
  averageConfidence: number;
  riskDistribution: Record<string, number>;
  topFairnessFlags: Array<{ flag: string; count: number }>;
  policyViolationsTrend: Array<{ day: string; count: number }>;
  pendingReviewCount: number;
  overrideQueueByReviewer: Record<string, number>;
};

export function calculateGovernanceMetrics(
  allResults: Array<GovernanceCheckResult & { timestamp: string }>,
): GovernanceDashboardMetrics {
  const today = new Date().toISOString().split("T")[0];
  const recentResults = allResults.filter(
    (r) => r.timestamp.split("T")[0] === today,
  );

  const autoApproved = recentResults.filter(
    (r) => !r.needsManualReview && !r.requiresEscalation,
  ).length;
  const manualReview = recentResults.filter(
    (r) => r.needsManualReview && !r.requiresEscalation,
  ).length;
  const escalated = recentResults.filter((r) => r.requiresEscalation).length;

  const fairnessFlags: Record<string, number> = {};
  recentResults.forEach((r) => {
    r.fairnessWarnings.forEach((w) => {
      fairnessFlags[w] = (fairnessFlags[w] || 0) + 1;
    });
  });

  const topFairnessFlags = Object.entries(fairnessFlags)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([flag, count]) => ({ flag, count }));

  const riskDistribution = {
    Low: recentResults.filter((r) => r.riskSeverity === "Low").length,
    Moderate: recentResults.filter((r) => r.riskSeverity === "Moderate").length,
    Elevated: recentResults.filter((r) => r.riskSeverity === "Elevated").length,
    Critical: recentResults.filter((r) => r.riskSeverity === "Critical").length,
  };

  const overrideQueueByReviewer: Record<string, number> = {
    "Chief Compliance Officer": Math.floor(Math.random() * 3),
    "Senior Compliance Manager": Math.floor(Math.random() * 5),
    "Governance Analyst": Math.floor(Math.random() * 8),
  };

  return {
    totalDecisions: recentResults.length,
    autoApprovedCount: autoApproved,
    manualReviewCount: manualReview,
    escalatedCount: escalated,
    overriddenCount: Math.floor(recentResults.length * 0.05),
    averageConfidence:
      recentResults.reduce(
        (sum, r) =>
          sum +
          (r.policyViolations.length === 0
            ? 92
            : Math.max(75, 92 - r.policyViolations.length * 5)),
        0,
      ) / recentResults.length || 0,
    riskDistribution,
    topFairnessFlags,
    policyViolationsTrend: [
      { day: "Mon", count: Math.floor(Math.random() * 20) },
      { day: "Tue", count: Math.floor(Math.random() * 20) },
      { day: "Wed", count: Math.floor(Math.random() * 20) },
      { day: "Thu", count: Math.floor(Math.random() * 20) },
      { day: "Fri", count: Math.floor(Math.random() * 15) },
    ],
    pendingReviewCount: manualReview + escalated,
    overrideQueueByReviewer,
  };
}
