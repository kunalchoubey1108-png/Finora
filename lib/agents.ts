import { createAuditRecord } from "./governance";
import { getBankConfig } from "./bankRegistry";
import type {
  AcquisitionStrategy,
  CampaignAction,
  LeadProfile,
  OfferRecommendation,
  OnboardingResult,
  PersonalizationOutput,
  LeadSegment,
  AuditRecord,
  KYCDecisionStatus,
} from "./types";

const channelSuites = {
  Digital: ["Social Media", "Search", "Programmatic Display"],
  Premium: ["Priority Email", "Wealth Webinar", "Executive Events"],
  SME: ["SMS Outreach", "Industry Newsletter", "B2B WhatsApp"],
};

const segmentMultiplier: Record<LeadSegment, number> = {
  "Premium Emerging": 1.18,
  "Urban Growth": 1.0,
  "SME Catalyst": 1.12,
  "Digital Saver": 0.94,
  "Wealth Builder": 1.28,
};

export function scoreLead(lead: LeadProfile): LeadProfile {
  const cityTierFactor =
    lead.cityTier === "metro" ? 5 : lead.cityTier === "tier-3" ? -5 : 0;
  const digitalComfort =
    typeof lead.digitalComfort === "number"
      ? lead.digitalComfort
      : lead.digitalAffinity;
  const productFit = Math.min(
    100,
    Math.round(
      lead.income / 2600 +
        lead.digitalAffinity * 0.32 +
        digitalComfort * 0.15 +
        14 +
        cityTierFactor,
    ),
  );
  const conversionProbability = Math.min(
    96,
    Math.round(
      lead.digitalAffinity * 0.45 +
        digitalComfort * 0.25 +
        lead.income / 3200 +
        segmentMultiplier[lead.segment] * 8 +
        lead.previousProducts.length * 4,
    ),
  );
  const expectedValue = Math.round(
    (lead.income / 2) * (productFit / 100) +
      15000 +
      segmentMultiplier[lead.segment] * 2000 +
      cityTierFactor * 300,
  );
  const complianceRisk = Math.min(
    98,
    Math.max(
      18,
      Math.round(
        (100 - digitalComfort) * 0.45 +
          lead.age * 0.12 +
          (lead.segment === "SME Catalyst" ? 10 : 0),
      ),
    ),
  );
  const confidence = Math.round(
    (conversionProbability + productFit + (100 - complianceRisk)) / 3,
  );
  const businessValue = Math.round(
    expectedValue * (productFit / 100) +
      conversionProbability * 420 -
      complianceRisk * 85,
  );
  const decisionGrade =
    businessValue >= 170000
      ? "A"
      : businessValue >= 140000
        ? "B"
        : businessValue >= 100000
          ? "C"
          : "D";

  return {
    ...lead,
    score: {
      conversionProbability,
      productFit,
      expectedValue,
      onboardingConfidence: Math.min(
        98,
        Math.round(digitalComfort * 0.6 + lead.digitalAffinity * 0.25 + 18),
      ),
      confidence,
      businessValue,
      complianceRisk,
      decisionGrade,
    },
  };
}

export function explainLeadPriority(lead: LeadProfile) {
  const reasons: string[] = [];
  reasons.push(
    `Business value of ₹${lead.score.businessValue.toLocaleString()} anchored the decision.`,
  );
  if (lead.digitalAffinity >= 85)
    reasons.push(
      "Strong digital adoption supports faster onboarding and campaign activation.",
    );
  if (lead.score.complianceRisk > 60)
    reasons.push(
      "Compliance risk is elevated and will require governance oversight.",
    );
  if (lead.persona.archetype)
    reasons.push(
      `Persona ${lead.persona.archetype} requires customised acquisition messaging.`,
    );
  return reasons;
}

export function makeAcquisitionStrategy(
  leads: LeadProfile[],
): AcquisitionStrategy {
  const topLead = leads[0];
  const channelType =
    topLead.segment === "SME Catalyst"
      ? "SME"
      : topLead.segment === "Premium Emerging"
        ? "Premium"
        : "Digital";
  const channelSelection = channelSuites[channelType];

  return {
    planName: `${topLead.segment} Governance-Aware Growth Plan`,
    primaryChannel: channelSelection[0],
    budgetAllocation: {
      [channelSelection[0]]: 48,
      [channelSelection[1]]: 30,
      [channelSelection[2]]: 22,
    },
    KPI: {
      cpl: topLead.segment === "SME Catalyst" ? 720 : 450,
      leadQuality: "High business value with monitored compliance triggers",
      timeToAcquireDays: 16,
    },
    rationale: `Build an acquisition path for ${topLead.segment} using ${channelSelection[0]} and safety guardrails for regulated leads.`,
    governanceControl:
      topLead.score.complianceRisk > 60
        ? "Campaign assets require compliance sign-off before go-live."
        : "Standard campaign guardrails with ongoing monitoring.",
  };
}

export function optimizeCampaign(
  strategy: AcquisitionStrategy,
  leads: LeadProfile[],
  bankId?: string,
): CampaignAction {
  const bank = getBankConfig(bankId);
  const expectedLift = leads[0].score.businessValue > 160000 ? "22%" : "14%";

  return {
    action: `Refine campaign targeting by prioritizing high-value segments and governance-approved creative hooks.`,
    optimizationFocus: `Align ${strategy.primaryChannel} spend with leads that show strong business value and controlled compliance exposure.`,
    expectedLift,
    notes: `Use asset variants that highlight secure ${bank.name} digital onboarding and regulated offer transparency.`,
    governanceNotes:
      "Exclude sensitive language from ads and ensure every campaign asset is audit-ready.",
  };
}

export function personalizeCommunication(
  lead: LeadProfile,
  bankId?: string,
): PersonalizationOutput {
  const bank = getBankConfig(bankId);
  const bankName = bank.name;
  const language = lead.preferredLanguage;
  const digitalComfort =
    typeof lead.digitalComfort === "number"
      ? lead.digitalComfort
      : lead.digitalAffinity;

  const recommendedChannel: string =
    digitalComfort >= 75
      ? "whatsapp"
      : digitalComfort >= 45
        ? "sms"
        : "branch-assisted";

  const headline =
    language === "Hindi"
      ? `नमस्ते ${lead.name}, ${bankName} आपके लिए विशेष बैंकिंग समाधान लेकर आया है।`
      : language === "Marathi"
        ? `नमस्कार ${lead.name}, ${bankName} तुमच्यासाठी खास बँकिंग ऑफर घेऊन आला आहे.`
        : `Hi ${lead.name}, ${bankName} has prepared a tailored banking recommendation for you.`;
  const body =
    language === "Hindi"
      ? `आपके वित्तीय लक्ष्यों को देखते हुए, हम एक सुरक्षित डिजिटल ऑनबोर्डिंग, विशेष बचत और क्रेडिट पैकेज की सलाह देते हैं।

यह यात्रा पूरी तरह से ऑडिटेबल है और आपके डेटा की सुरक्षा हमारी प्राथमिकता है।`
      : language === "Marathi"
        ? `तुमच्या आर्थिक उद्दिष्टांना ध्यानात घेऊन, आम्ही सुरक्षित डिजिटल ऑनबोर्डिंगसह खास बचत व क्रेडिट पॅकेज सुचवतो.

ही प्रक्रिया पूर्णपणे ऑडिटेबल आहे आणि तुमच्या डेटाचे संरक्षण आमची प्राथमिकता आहे.`
        : `Based on your profile, ${bankName} recommends a secure digital onboarding journey with a curated savings and credit package.

This path is fully auditable and aligned with regulatory governance for every decision.`;

  return {
    audienceSynopsis: `Personalized ${lead.segment} communication in ${language} with compliance-safe messaging. Recommended channel: ${recommendedChannel}.`,
    languageUsed: language,
    message: `${headline}

${body}

City-specific insights are tailored for ${lead.city}.
Recommended channel: ${recommendedChannel}.`,
  };
}

export function recommendOffer(lead: LeadProfile, bankId?: string): OfferRecommendation {
  const bank = getBankConfig(bankId);
  const recProduct = bank.products[lead.segment] || "Savings Account";

  // Map segments to demo-friendly Indian banking product journeys
  const productMap: Record<LeadSegment, OfferRecommendation> = {
    "Urban Growth": {
      recommendation: recProduct,
      rationale:
        "A salary or primary savings account with instant debit provisioning and UPI setup for urban customers.",
      onboardingTrack: "Self-serve Video KYC with optional branch support",
      governanceLabel: "Auto-approve with monitoring",
    },
    "Premium Emerging": {
      recommendation: recProduct,
      rationale:
        "High-touch onboarding with advisory and premium banking features for emerging affluent customers.",
      onboardingTrack: "RM-assisted onboarding with enhanced KYC",
      governanceLabel: "Manual review before offer activation",
    },
    "SME Catalyst": {
      recommendation: recProduct,
      rationale:
        "Business current account with payments and working capital support for merchants and SMEs.",
      onboardingTrack:
        "Documentary KYC with video verification and business checks",
      governanceLabel: "Enhanced review triggered by business risk signals",
    },
    "Digital Saver": {
      recommendation: recProduct,
      rationale:
        "Low-friction student/saver journey with entry-level credit and digital-first onboarding.",
      onboardingTrack: "Mobile-first Video KYC and instant debit provisioning",
      governanceLabel: "Auto-approved with fraud monitoring",
    },
    "Wealth Builder": {
      recommendation: recProduct,
      rationale:
        "Premium wealth onboarding with advisory, relationship manager and secure identity validation.",
      onboardingTrack: "RM-assisted onboarding with senior compliance review",
      governanceLabel: "Senior compliance review required",
    },
  };

  return productMap[lead.segment];
}

export function conductVideoKYC(lead: LeadProfile): OnboardingResult {
  // Derive richer signals for a realistic demo
  const onboardingScore = lead.score.onboardingConfidence;
  const ocrConfidence = Math.max(
    40,
    Math.round(onboardingScore * 0.8 - (lead.score.complianceRisk - 30) * 0.25),
  );
  const faceMatchScore = Math.max(
    30,
    Math.round(onboardingScore * 0.9 - (lead.age > 60 ? 8 : 0)),
  );
  const livenessScore = Math.max(
    35,
    Math.round(
      onboardingScore * 0.85 -
        (lead.riskSignals.includes("Unstable network") ? 12 : 0),
    ),
  );

  const spoofRisk =
    lead.riskSignals.includes("New device") ||
    lead.score.complianceRisk >= 78 ||
    livenessScore < 50;
  const exceptionFlags: string[] = [];

  if (ocrConfidence < 75) exceptionFlags.push("Low OCR confidence");
  if (faceMatchScore < 80) exceptionFlags.push("Face match below threshold");
  if (livenessScore < 70) exceptionFlags.push("Weak liveness signal");
  if (spoofRisk) exceptionFlags.push("Potential spoof risk detected");
  if (lead.score.complianceRisk >= 70)
    exceptionFlags.push("Elevated compliance risk");

  // Determine status with believable thresholds
  const status: KYCDecisionStatus = spoofRisk
    ? "Spoof Risk"
    : ocrConfidence >= 85 && faceMatchScore >= 88 && livenessScore >= 80
      ? "Completed"
      : ocrConfidence >= 75 && faceMatchScore >= 80
        ? "Manual Review"
        : "Exception Routed";

  const manualReviewPath = spoofRisk
    ? "Security desk review with second biometric validation and device trust check."
    : status === "Manual Review"
      ? "Assign to compliance team for document and identity reconciliation."
      : "Route to enhanced onboarding queue for data verification.";

  const sessionId = `kyc_${lead.id}_${Date.now()}`;

  const sessionEvents: AuditRecord[] = [
    createAuditRecord(
      "Video KYC Initialization",
      "Session started",
      "Video KYC session launched with consent and encrypted transport.",
      Math.round(onboardingScore * 0.7),
      spoofRisk,
      "KYC Operations",
      "Session metadata captured for audit.",
    ),
    createAuditRecord(
      "Document OCR",
      `OCR confidence ${ocrConfidence}%`,
      ocrConfidence < 75
        ? "OCR returned low confidence — possible blur or document issue."
        : "OCR extracted structured identity fields successfully.",
      ocrConfidence,
      ocrConfidence < 75,
      "KYC Operations",
      "OCR steps and extracted fields recorded.",
    ),
    createAuditRecord(
      "Face Match",
      `Face match score ${faceMatchScore}%`,
      faceMatchScore < 80
        ? "Face match below threshold"
        : "Face match acceptable",
      faceMatchScore,
      faceMatchScore < 80,
      "Biometrics",
      "Face comparison against ID photo performed.",
    ),
    createAuditRecord(
      "Liveness Check",
      `Liveness score ${livenessScore}%`,
      livenessScore < 70 ? "Liveness weak" : "Liveness acceptable",
      livenessScore,
      livenessScore < 70,
      "Biometrics",
      "Behavioral liveness and motion analysis logged.",
    ),
    createAuditRecord(
      "KYC Decision",
      `Final route: ${status}`,
      `Decision by automated assessment with confidence ${onboardingScore}% and compliance risk ${lead.score.complianceRisk}%.`,
      Math.round(onboardingScore),
      status !== "Completed",
      "Compliance Team",
      manualReviewPath,
    ),
  ];

  // Build a friendly mismatch reason where applicable
  let mismatchReason = "";
  if (faceMatchScore < 80)
    mismatchReason =
      "Face-photo mismatch likely due to image quality or identity discrepancy.";
  if (ocrConfidence < 70)
    mismatchReason =
      mismatchReason || "OCR failed to reliably extract identity fields.";

  return {
    status,
    verificationDetails:
      status === "Completed"
        ? "Video KYC completed with biometrics, identity documents and consent audit."
        : status === "Manual Review"
          ? "Video KYC requires manual reconciliation due to intermediate risk signals."
          : "Video KYC was routed to exception handling for additional review.",
    securityHighlights: [
      "Secure video session with AES encryption",
      "Biometric and liveness checks logged for compliance",
      "Audit-ready decision path for every onboarding step",
    ],
    exceptionFlags,
    manualReviewPath,
    auditTrail: sessionEvents,
    sessionId,
    extractedName: lead.name,
    extractedDOB: undefined,
    documentType: "ID Document",
    ocrConfidence,
    faceMatchScore,
    livenessScore,
    spoofRiskFlag: spoofRisk,
    mismatchReason: mismatchReason || undefined,
    manualReviewNote:
      status === "Manual Review"
        ? "Please reconcile document fields and face match."
        : undefined,
    sessionEvents,
  };
}

export function determinePrimarySegment(leads: LeadProfile[]): LeadSegment {
  const segmentCounts = leads.reduce<Record<LeadSegment, number>>(
    (acc, lead) => {
      acc[lead.segment] = (acc[lead.segment] ?? 0) + 1;
      return acc;
    },
    {
      "Premium Emerging": 0,
      "Urban Growth": 0,
      "SME Catalyst": 0,
      "Digital Saver": 0,
      "Wealth Builder": 0,
    },
  );

  return (
    (Object.entries(segmentCounts).sort(
      (a, b) => b[1] - a[1],
    )[0][0] as LeadSegment) ?? "Urban Growth"
  );
}
