import { productBundles } from "../data/productBundles";
import type {
  LeadProfile,
  OfferCandidate,
  OfferPersonalizationResult,
  PolicyStatus,
} from "./types";

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

function hasSalaryHistory(lead: LeadProfile) {
  return lead.previousProducts.some((product) =>
    /Salary|Salary Account/i.test(product),
  );
}

function segmentMatch(lead: LeadProfile, candidate: OfferCandidate) {
  return candidate.segmentAffinity.includes(lead.segment) ? 1 : 0;
}

function motivationAlignment(lead: LeadProfile, candidate: OfferCandidate) {
  const text =
    `${lead.persona.motivation} ${candidate.description}`.toLowerCase();
  const keywords = [
    "cashback",
    "reward",
    "welcome",
    "advisory",
    "business",
    "digital",
  ];
  const matches = keywords.filter((keyword) => text.includes(keyword)).length;
  return clamp(Math.round((matches / keywords.length) * 15), 0, 15);
}

function incomeFit(lead: LeadProfile, candidate: OfferCandidate) {
  if (!candidate.minIncome) return 15;
  const ratio = lead.income / candidate.minIncome;
  if (ratio >= 1.2) return 15;
  if (ratio >= 1.0) return 12;
  if (ratio >= 0.85) return 8;
  return 3;
}

function digitalFit(lead: LeadProfile, candidate: OfferCandidate) {
  if (!candidate.digitalAffinityMin) return 12;
  const gap = lead.digitalAffinity - candidate.digitalAffinityMin;
  return clamp(12 + Math.round(gap * 0.2), 0, 12);
}

function productHistoricFit(lead: LeadProfile, candidate: OfferCandidate) {
  const history = lead.previousProducts.join(" ").toLowerCase();
  const matchCount = candidate.products.reduce(
    (count, product) =>
      history.includes(product.toLowerCase().split(" ")[0]) ? count + 1 : count,
    0,
  );
  return clamp(matchCount * 5 + 5, 5, 15);
}

function complianceFit(lead: LeadProfile, candidate: OfferCandidate) {
  if (candidate.policyStatus === "manual-review") return 7;
  if (candidate.policyStatus === "borderline") return 10;
  return 13;
}

function determinePolicyStatus(
  lead: LeadProfile,
  candidate: OfferCandidate,
): PolicyStatus {
  if (candidate.requiresSalaryAccount && !hasSalaryHistory(lead)) {
    return "manual-review";
  }

  if (
    candidate.minIncome &&
    lead.income < candidate.minIncome * 0.9 &&
    candidate.policyStatus === "policy-compliant"
  ) {
    return "borderline";
  }

  if (candidate.policyStatus === "manual-review") return "manual-review";
  return candidate.policyStatus;
}

function determineEligibility(
  lead: LeadProfile,
  candidate: OfferCandidate,
): "eligible" | "borderline" | "ineligible" {
  if (candidate.requiresSalaryAccount && !hasSalaryHistory(lead)) {
    return "ineligible";
  }
  if (candidate.minIncome && lead.income < candidate.minIncome * 0.8) {
    return "ineligible";
  }
  if (
    candidate.digitalAffinityMin &&
    lead.digitalAffinity < candidate.digitalAffinityMin - 15
  ) {
    return "ineligible";
  }
  if (candidate.segmentAffinity.includes(lead.segment)) {
    return "eligible";
  }
  return "borderline";
}

function buildWhyThisOffer(
  lead: LeadProfile,
  candidate: OfferCandidate,
  fitScore: number,
) {
  const reasons: string[] = [];
  if (candidate.segmentAffinity.includes(lead.segment)) {
    reasons.push(`Strong segment fit for ${lead.segment} customers.`);
  }
  if (candidate.benefitsTheme === "cashback") {
    reasons.push("Great match for value-conscious customers seeking cashback.");
  }
  if (candidate.benefitsTheme === "reward") {
    reasons.push("Reward-led benefits resonate with aspirational lifestyles.");
  }
  if (candidate.benefitsTheme === "welcome incentive") {
    reasons.push("Onboarding incentives improve first-time activation.");
  }
  if (candidate.benefitsTheme === "advisory") {
    reasons.push("Advisory support aligns with higher lifetime value needs.");
  }
  if (candidate.benefitsTheme === "security") {
    reasons.push(
      "Security and trust signals support conversions in cautious segments.",
    );
  }
  reasons.push(
    `Overall fit score is ${fitScore}/100 based on income, digital readiness, and policy alignment.`,
  );
  return reasons.join(" ");
}

function buildWhyNotShown(lead: LeadProfile, candidate: OfferCandidate) {
  const reasons: string[] = [];
  if (candidate.requiresSalaryAccount && !hasSalaryHistory(lead)) {
    reasons.push(
      "Requires salary account verification, which the profile does not clearly satisfy.",
    );
  }
  if (candidate.minIncome && lead.income < candidate.minIncome) {
    reasons.push(
      "Income is below the target threshold for this premium bundle.",
    );
  }
  if (
    candidate.digitalAffinityMin &&
    lead.digitalAffinity < candidate.digitalAffinityMin
  ) {
    reasons.push(
      "Digital readiness is lower than the bundle's preferred digital onboarding profile.",
    );
  }
  if (!candidate.segmentAffinity.includes(lead.segment)) {
    reasons.push(
      `The lead's segment (${lead.segment}) is not the primary affinity for this bundle.`,
    );
  }
  if (reasons.length === 0) {
    reasons.push(
      "Other offers are prioritized because they better match this customer's banking goals.",
    );
  }
  return reasons;
}

function normalizeOfferCandidate(candidate: OfferCandidate) {
  return {
    ...candidate,
    manualOverride: "none" as const,
  };
}

export function generateOfferPersonalization(
  lead: LeadProfile,
): OfferPersonalizationResult {
  const scoredCandidates = productBundles.map((rawCandidate) => {
    const candidate = normalizeOfferCandidate(rawCandidate);
    const eligibility = determineEligibility(lead, candidate);
    const policyStatus = determinePolicyStatus(lead, candidate);
    const score = clamp(
      Math.round(
        segmentMatch(lead, candidate) * 30 +
          incomeFit(lead, candidate) +
          digitalFit(lead, candidate) +
          productHistoricFit(lead, candidate) +
          motivationAlignment(lead, candidate) +
          complianceFit(lead, candidate),
      ),
      0,
      100,
    );

    const updatedCandidate: OfferCandidate = {
      ...candidate,
      fitScore: score,
      policyStatus,
      eligibility,
      whyThisOffer: buildWhyThisOffer(lead, candidate, score),
      whyNotShown: buildWhyNotShown(lead, candidate),
      reviewHint:
        policyStatus === "manual-review"
          ? "Manual compliance review recommended for this offer."
          : policyStatus === "borderline"
            ? "Borderline fit; use a governance check before advancing."
            : "Policy-compliant offer with explainable fit reasoning.",
    };

    return updatedCandidate;
  });

  const eligibleOffers = scoredCandidates
    .filter((candidate) => candidate.eligibility === "eligible")
    .sort((a, b) => b.fitScore - a.fitScore);

  const borderlineOffers = scoredCandidates.filter(
    (candidate) => candidate.eligibility === "borderline",
  );

  const ineligibleOffers = scoredCandidates.filter(
    (candidate) => candidate.eligibility === "ineligible",
  );

  const topOffers = eligibleOffers.slice(0, 3).map((candidate) => ({
    ...candidate,
    manualOverride: "none" as const,
  }));

  const declinedOffers = [...borderlineOffers, ...ineligibleOffers].map(
    (candidate) => ({
      ...candidate,
      manualOverride: "none" as const,
    }),
  );

  const policySummary = topOffers.some(
    (offer) => offer.policyStatus === "manual-review",
  )
    ? "One or more top offers require manual governance review before activation."
    : topOffers.some((offer) => offer.policyStatus === "borderline")
      ? "Top offers are viable but should be monitored for policy alignment."
      : "Top offers are policy-compliant and ready for governed recommendation.";

  return {
    leadId: lead.id,
    leadName: lead.name,
    topOffers,
    declinedOffers,
    policySummary,
    explainableNote:
      "Illustrative demo logic: these offers are recommended based on eligibility, segment fit, and policy guardrails.",
    reviewerHint:
      "Use the manual override controls when a product specialist needs to approve or reject a recommendation.",
    manualOverrideAction: "none",
  };
}
