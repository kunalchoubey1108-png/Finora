/**
 * Business-Value-Aware Lead Scoring Engine
 *
 * Implements a sophisticated composite scoring model that evaluates leads across
 * five core dimensions plus uplift potential and risk signals. Designed for
 * realistic Indian banking customer acquisition scenarios.
 */

import type {
  LeadProfile,
  PersonaTag,
  ScoreBand,
  CompositeLeadScore,
} from "./types";

export interface ScoringDimension {
  name: string;
  score: number;
  weight: number;
  rationale: string;
}

export interface EnhancedLeadScore extends CompositeLeadScore {
  dimensions: ScoringDimension[];
}

// ============================================================================
// SCORING LOGIC
// ============================================================================

/**
 * Calculate conversion propensity based on:
 * - Digital affinity (higher = more likely to self-onboard)
 * - Age (25-45 sweet spot)
 * - Previous products (sticky customer indicator)
 */
export function calculateConversionPropensity(lead: LeadProfile): number {
  let score = 50; // Base

  // Digital affinity: 0-30 points
  score += Math.min(lead.digitalAffinity, 100) * 0.3;

  // Age preference: 25-45 is ideal (25 points bonus)
  if (lead.age >= 25 && lead.age <= 45) {
    score += 25;
  } else if (lead.age >= 22 && lead.age <= 50) {
    score += 15;
  } else if (lead.age < 22) {
    score -= 20; // Very young
  } else if (lead.age > 60) {
    score -= 15; // Fairness check: age discrimination
  }

  // Previous products: each adds trust
  score += Math.min(lead.previousProducts.length * 5, 25);

  // Risk signal penalty
  const hasRiskSignal = lead.riskSignals?.some(
    (r) =>
      r.includes("New device") ||
      r.includes("Premium lifestyle") ||
      r.includes("Multiple attempts"),
  );
  if (hasRiskSignal) score -= 10;

  return Math.min(Math.max(score, 10), 100);
}

/**
 * Calculate expected value (LTV proxy) based on:
 * - Annual income (strong indicator of product uptake & CASA balances)
 * - Segment tier (premium > emerging > growth)
 * - Product expansion potential
 */
export function calculateExpectedValue(lead: LeadProfile): number {
  let ltv = 0;

  // Income-based LTV model
  if (lead.income < 300000) {
    ltv = lead.income * 0.4; // 40% annual income as year-1 LTV
  } else if (lead.income < 1000000) {
    ltv = lead.income * 0.5; // 50% for mid-income
  } else {
    ltv = lead.income * 0.6; // 60% for HNI
  }

  // Segment multiplier
  const segmentMultiplier: Record<string, number> = {
    "Premium Emerging": 1.4,
    "Wealth Builder": 1.3,
    "Urban Growth": 1.1,
    "SME Catalyst": 0.95,
    "Digital Saver": 0.8,
  };

  ltv *= segmentMultiplier[lead.segment] || 1.0;

  // Product expansion potential (each existing product = upsell opportunity)
  const expandability = lead.previousProducts.length;
  ltv *= 1 + expandability * 0.15;

  return Math.round(ltv);
}

/**
 * Calculate onboarding ease based on:
 * - Digital affinity (can self-onboard via app)
 * - Age & tech comfort
 * - Language preferences (English/Hindi = easier)
 * - Segment requirements (Digital Saver = easiest, Premium Emerging = harder)
 */
export function calculateOnboardingEase(lead: LeadProfile): number {
  let score = 50; // Base

  // Digital affinity: strong predictor
  score += lead.digitalAffinity * 0.5; // Up to 50 points

  // Language: English/Hindi = +10, others = +0
  if (
    lead.preferredLanguage === "English" ||
    lead.preferredLanguage === "Hindi"
  ) {
    score += 10;
  }

  // Age factor
  if (lead.age >= 25 && lead.age <= 55) {
    score += 15;
  } else if (lead.age < 25) {
    score += 10;
  } else {
    score += 5; // Older folks need more support
  }

  // Segment friction
  const segmentFriction: Record<string, number> = {
    "Digital Saver": 20,
    "Urban Growth": 15,
    "Premium Emerging": -10, // Needs advisor handoff
    "SME Catalyst": -15, // Needs enhanced KYC
    "Wealth Builder": -5,
  };

  score += segmentFriction[lead.segment] || 0;

  // Previous products = easier (already documented)
  score += Math.min(lead.previousProducts.length * 3, 10);

  // Risk signals that indicate friction
  const hasFriction = lead.riskSignals?.some(
    (r) => r.includes("Cross-product") || r.includes("Multiple signatories"),
  );
  if (hasFriction) score -= 15;

  return Math.min(Math.max(score, 10), 100);
}

/**
 * Calculate product affinity based on:
 * - Income alignment with product tiers
 * - Segment product fit
 * - Challenge alignment
 * - Previous product patterns
 */
export function calculateProductAffinity(lead: LeadProfile): number {
  let score = 50; // Base

  // Income-to-product fit
  if (lead.income < 250000) {
    // Savings-focused
    if (lead.segment === "Digital Saver" || lead.segment === "Urban Growth") {
      score += 25;
    }
  } else if (lead.income < 750000) {
    // Credit & investment focused
    if (
      lead.segment === "Urban Growth" ||
      lead.segment === "Premium Emerging" ||
      lead.segment === "Wealth Builder"
    ) {
      score += 25;
    }
  } else {
    // HNI/Wealth focused
    if (
      lead.segment === "Premium Emerging" ||
      lead.segment === "Wealth Builder"
    ) {
      score += 25;
    }
  }

  // Challenge relevance
  if (
    lead.challengeSummary.includes("cashflow") ||
    lead.challengeSummary.includes("payment")
  ) {
    score += 15;
  }
  if (
    lead.challengeSummary.includes("savings") ||
    lead.challengeSummary.includes("reward")
  ) {
    score += 12;
  }

  // Previous product momentum
  if (lead.previousProducts.length >= 3) {
    score += 18;
  } else if (lead.previousProducts.length >= 1) {
    score += 10;
  }

  // Persona fit
  if (lead.personaTags?.includes("Premium Spender")) {
    score += 12;
  }
  if (lead.personaTags?.includes("Merchant/MSME")) {
    score += 10;
  }

  return Math.min(Math.max(score, 10), 100);
}

/**
 * Calculate acquisition efficiency based on:
 * - Segment CAC (customer acquisition cost)
 * - Digital channel economics (lower CAC)
 * - Expected value vs. effort ratio
 */
export function calculateAcquisitionEfficiency(lead: LeadProfile): number {
  let score = 50; // Base

  // Channel economics: digital > partner > direct sales
  if (lead.digitalAffinity > 85) {
    score += 25; // Digital direct channel = efficient
  } else if (lead.digitalAffinity > 60) {
    score += 15;
  } else {
    score += 5; // Needs advisor contact
  }

  // Segment CAC model (lower CAC for scale segments)
  const segmentCAC: Record<string, number> = {
    "Digital Saver": 350, // Lowest CAC
    "Urban Growth": 600,
    "SME Catalyst": 850,
    "Premium Emerging": 1200, // Highest CAC
    "Wealth Builder": 900,
  };

  const cac = segmentCAC[lead.segment] || 800;
  const ltv = calculateExpectedValue(lead);

  // LTV/CAC ratio efficiency
  const ratio = ltv / cac;
  if (ratio > 5) {
    score += 25;
  } else if (ratio > 3) {
    score += 15;
  } else if (ratio > 1.5) {
    score += 5;
  } else {
    score -= 10; // Inefficient
  }

  return Math.min(Math.max(score, 10), 100);
}

/**
 * Calculate uplift potential (responsiveness to SBI intervention):
 * - How much intervention can move the needle
 * - Personalization opportunities
 * - Channel optimization potential
 */
export function calculateUpliftPotential(lead: LeadProfile): number {
  let score = 50; // Base

  // High digital affinity = lower uplift (already high propensity)
  if (lead.digitalAffinity > 85) {
    score -= 15; // Already converted via digital
  } else if (lead.digitalAffinity < 40) {
    score += 20; // High uplift from advisor touch
  } else {
    score += 10; // Moderate uplift
  }

  // Segment-based uplift
  if (lead.segment === "Premium Emerging") {
    score += 15; // Advisor handoff can drive premium products
  }
  if (lead.segment === "SME Catalyst") {
    score += 12; // Business advisory potential
  }

  // Cross-sell opportunities
  if (lead.previousProducts.length < 2) {
    score += 15; // Fresh customer = higher uplift from personalization
  }

  // Challenge alignment with SBI solutions
  if (lead.challengeSummary.includes("advisory")) {
    score += 12;
  }
  if (lead.challengeSummary.includes("automation")) {
    score += 10;
  }

  // Risk signals indicating conversion friction (uplift = removing friction)
  if (lead.riskSignals?.length > 0) {
    score += 8; // Addressing signals = uplift
  }

  return Math.min(Math.max(score, 10), 100);
}

/**
 * Determine score band based on composite score
 */
export function determineScoreBand(compositeScore: number): ScoreBand {
  if (compositeScore >= 85) return "Strategic Priority";
  if (compositeScore >= 75) return "High";
  if (compositeScore >= 60) return "Medium";
  return "Low";
}

/**
 * Determine persona tags for the lead
 */
export function determinePersonaTags(lead: LeadProfile): PersonaTag[] {
  const tags: PersonaTag[] = [];

  // Age-based
  if (lead.age < 25) {
    tags.push("Student Starter");
  } else if (lead.age >= 25 && lead.age <= 35) {
    tags.push("Salaried Urban");
  } else if (lead.age > 60) {
    tags.push("Retiree");
  }

  // Income-based
  if (lead.income > 1000000) {
    tags.push("Premium Spender");
  }

  // Segment-based
  if (lead.segment === "SME Catalyst") {
    tags.push("Merchant/MSME");
  }
  if (lead.segment === "Premium Emerging") {
    tags.push("Emerging Executive");
  }

  // Challenge-based
  if (
    lead.challengeSummary.includes("business") ||
    lead.challengeSummary.includes("working capital")
  ) {
    if (!tags.includes("Merchant/MSME")) tags.push("Self-Employed");
  }

  // Digital profile
  if (lead.digitalAffinity > 85 && lead.age < 40) {
    if (!tags.includes("Salaried Urban")) tags.push("Salaried Urban");
  }

  // De-duplicate and ensure we have at least one
  const unique = Array.from(new Set(tags));
  return unique.length > 0 ? unique : ["Salaried Urban"];
}

/**
 * Extract top positive factors driving the score
 */
export function getTopPositiveFactors(
  lead: LeadProfile,
  dimensions: ScoringDimension[],
): string[] {
  const factors: string[] = [];

  // Sort dimensions by score
  const sorted = [...dimensions].sort((a, b) => b.score - a.score);

  // Add top scorers
  if (sorted[0]?.score > 70) {
    factors.push(sorted[0].rationale);
  }
  if (sorted[1]?.score > 70 && factors.length < 3) {
    factors.push(sorted[1].rationale);
  }
  if (sorted[2]?.score > 60 && factors.length < 3) {
    factors.push(sorted[2].rationale);
  }

  // Add data points
  if (lead.income > 1000000 && !factors.some((f) => f.includes("income"))) {
    factors.push(
      `High income (₹${(lead.income / 100000).toFixed(1)}L) indicates strong repayment capacity`,
    );
  }

  if (
    lead.digitalAffinity > 85 &&
    !factors.some((f) => f.includes("digital"))
  ) {
    factors.push(
      `Exceptional digital affinity (${lead.digitalAffinity}%) enables self-onboarding`,
    );
  }

  if (
    lead.previousProducts.length >= 3 &&
    !factors.some((f) => f.includes("product"))
  ) {
    factors.push(
      `Existing customer with ${lead.previousProducts.length} products = trusted relationship`,
    );
  }

  return factors.slice(0, 3);
}

/**
 * Extract top risk/friction factors
 */
export function getTopRiskFactors(lead: LeadProfile): string[] {
  const factors: string[] = [];

  // Governance flags
  if (lead.governanceFlags?.length > 0) {
    factors.push(lead.governanceFlags[0]);
  }

  // Risk signals
  if (lead.riskSignals?.length > 0) {
    factors.push(lead.riskSignals[0]);
  }

  // Compliance risk
  if ((lead.complianceRisk ?? 0) > 50) {
    factors.push(
      `Elevated compliance risk (${lead.complianceRisk}%) requires enhanced KYC`,
    );
  }

  // Segment friction
  if (
    lead.segment === "Premium Emerging" ||
    lead.segment === "SME Catalyst" ||
    lead.segment === "Wealth Builder"
  ) {
    factors.push(`${lead.segment} segment requires advisory-led onboarding`);
  }

  // Age fairness check
  if (lead.age > 60) {
    factors.push("Age >60: Consider accessibility & simplicity requirements");
  }
  if (lead.age < 22) {
    factors.push("Age <22: Enhanced identity verification required");
  }

  return factors.slice(0, 2);
}

/**
 * Recommend acquisition route
 */
export function recommendAcquisitionRoute(lead: LeadProfile): string {
  if (lead.digitalAffinity > 85 && lead.segment !== "Premium Emerging") {
    return "Direct digital (app self-service)";
  }

  if (
    lead.segment === "Premium Emerging" ||
    lead.segment === "Wealth Builder"
  ) {
    return "Advisor-led (personal outreach + consultation)";
  }

  if (lead.segment === "SME Catalyst") {
    return "Business banking partner (indirect channel with support)";
  }

  if (lead.digitalAffinity > 65) {
    return "Digital-first with agent support (co-browsing)";
  }

  return "Agent-assisted (phone/video call)";
}

/**
 * Generate composite lead score with full explainability
 */
export function scoreLeadWithIntelligence(
  lead: LeadProfile,
): EnhancedLeadScore {
  // Calculate dimensions
  const conversionPropensity = calculateConversionPropensity(lead);
  const expectedValue = calculateExpectedValue(lead);
  const onboardingEase = calculateOnboardingEase(lead);
  const productAffinity = calculateProductAffinity(lead);
  const acquisitionEfficiency = calculateAcquisitionEfficiency(lead);
  const upsellPotential = calculateUpliftPotential(lead);

  // Composite calculation (weighted average)
  const weights = {
    conversionPropensity: 0.25,
    onboardingEase: 0.2,
    productAffinity: 0.2,
    acquisitionEfficiency: 0.2,
    upsellPotential: 0.15,
  };

  const compositeScore = Math.round(
    conversionPropensity * weights.conversionPropensity +
      onboardingEase * weights.onboardingEase +
      productAffinity * weights.productAffinity +
      acquisitionEfficiency * weights.acquisitionEfficiency +
      upsellPotential * weights.upsellPotential,
  );

  const scoreBand = determineScoreBand(compositeScore);

  // Calculate dimensions array for dashboard
  const dimensions: ScoringDimension[] = [
    {
      name: "Conversion Propensity",
      score: conversionPropensity,
      weight: weights.conversionPropensity,
      rationale:
        "Likelihood to convert based on digital affinity, age, and history",
    },
    {
      name: "Onboarding Ease",
      score: onboardingEase,
      weight: weights.onboardingEase,
      rationale: "Ease of onboarding via digital or assisted channels",
    },
    {
      name: "Product Affinity",
      score: productAffinity,
      weight: weights.productAffinity,
      rationale: "Fit with SBI's product suite and segment offerings",
    },
    {
      name: "Acquisition Efficiency",
      score: acquisitionEfficiency,
      weight: weights.acquisitionEfficiency,
      rationale: "Cost-effectiveness of acquisition for this lead",
    },
    {
      name: "Uplift Potential",
      score: upsellPotential,
      weight: weights.upsellPotential,
      rationale: "Responsiveness to SBI intervention and personalization",
    },
  ];

  // Populate enriched lead fields
  const personaTags = determinePersonaTags(lead);
  const topPositiveFactors = getTopPositiveFactors(lead, dimensions);
  const topRiskFactors = getTopRiskFactors(lead);
  const recommendedRoute = recommendAcquisitionRoute(lead);

  // Backward compatibility mapping
  const ltv = expectedValue;
  const confidenceScore = (compositeScore + conversionPropensity) / 2;

  return {
    conversionPropensity,
    expectedValue,
    onboardingEase,
    productAffinity,
    acquisitionEfficiency,
    upsellPotential,
    compositeScore,
    scoreBand,
    dimensions,
    // Legacy fields
    conversionProbability: conversionPropensity,
    productFit: productAffinity,
    onboardingConfidence: onboardingEase,
    confidence: Math.round(confidenceScore),
    businessValue: ltv,
    complianceRisk: lead.complianceRisk ?? 40,
    decisionGrade:
      scoreBand === "Strategic Priority"
        ? "A"
        : scoreBand === "High"
          ? "B"
          : "C",
  };
}

/**
 * Bulk score multiple leads for dashboard
 */
export function scoreLeadsWithIntelligence(
  leads: LeadProfile[],
): (LeadProfile & { scoreIntelligence: EnhancedLeadScore })[] {
  return leads.map((lead) => {
    const scoreIntelligence = scoreLeadWithIntelligence(lead);
    const personaTags = determinePersonaTags(lead);
    const topPositiveFactors = getTopPositiveFactors(
      lead,
      scoreIntelligence.dimensions,
    );
    const topRiskFactors = getTopRiskFactors(lead);
    const recommendedRoute = recommendAcquisitionRoute(lead);

    return {
      ...lead,
      personaTags,
      topPositiveFactors,
      topRiskFactors,
      recommendedAcquisitionRoute: recommendedRoute,
      scoreIntelligence,
      score: scoreIntelligence,
    };
  });
}
