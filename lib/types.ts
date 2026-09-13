export type LanguagePreference = "English" | "Hindi" | "Marathi" | "Tamil";

export type PersonaTag =
  | "Salaried Urban"
  | "Student Starter"
  | "Merchant/MSME"
  | "Premium Spender"
  | "Self-Employed"
  | "Emerging Executive"
  | "SME Operator"
  | "Gig Worker"
  | "Retiree"
  | "New to Banking";

export type ScoreBand = "Low" | "Medium" | "High" | "Strategic Priority";

export type LeadSegment =
  | "Premium Emerging"
  | "Urban Growth"
  | "SME Catalyst"
  | "Digital Saver"
  | "Wealth Builder";

export type KYCDecisionStatus =
  | "Completed"
  | "Manual Review"
  | "Exception Routed"
  | "Spoof Risk";

export type RiskTier = "Low" | "Moderate" | "Elevated" | "Critical";

export type StageStatus = "Completed" | "Review Required" | "Pending";

export type LeadPersona = {
  title: string;
  archetype: string;
  motivation: string;
};

export type CompositeLeadScore = {
  // Core scoring dimensions
  conversionPropensity?: number; // 0-100: likelihood to convert
  expectedValue?: number; // ₹ value: proxy LTV
  onboardingEase?: number; // 0-100: ease of onboarding
  productAffinity?: number; // 0-100: fit with the acquiring institution's products
  acquisitionEfficiency?: number; // 0-100: cost vs. value

  // Uplift & responsiveness
  upsellPotential?: number; // 0-100: likely responsiveness to intervention

  // Composite measures
  compositeScore?: number; // 0-100: weighted composite
  scoreBand?: ScoreBand; // Banding: Low/Medium/High/Strategic

  // Legacy fields (always present)
  conversionProbability: number;
  productFit: number;
  onboardingConfidence: number;
  confidence: number;
  businessValue: number;
  complianceRisk: number;
  decisionGrade: "A" | "B" | "C" | "D";
};

export type LeadScore = CompositeLeadScore;

export type LeadProfile = {
  id: string;
  name: string;
  city: string;
  cityTier?: "metro" | "tier-2" | "tier-3";
  region?: "North" | "South" | "East" | "West" | "Central" | "North-East";
  age: number;
  income: number;
  digitalAffinity: number;
  digitalComfort?: number; // 0-100: comfort with digital channels
  preferredChannel?: Channel;
  onboardingPath?: "branch-assisted" | "self-serve" | "rm-assisted";
  preferredLanguage: LanguagePreference;
  persona: LeadPersona;
  personaTags?: PersonaTag[]; // New: Persona classification tags
  previousProducts: string[];
  segment: LeadSegment;
  challengeSummary: string;
  riskSignals: string[];
  governanceFlags: string[];
  regulatoryNotes: string;
  score: LeadScore;
  isPrimary?: boolean;

  // New explainability fields
  topPositiveFactors?: string[]; // Top 3 positive factors
  topRiskFactors?: string[]; // Top 2 risk/friction factors
  recommendedAcquisitionRoute?: string; // How to acquire (direct, channel, referral, etc.)
  priorityReason?: string; // Why prioritize (or why not)
  complianceRisk?: number; // Compliance risk score 0-100
};

export type AcquisitionStrategy = {
  planName: string;
  primaryChannel: string;
  budgetAllocation: Record<string, number>;
  KPI: {
    cpl: number;
    leadQuality: string;
    timeToAcquireDays: number;
  };
  rationale: string;
  governanceControl: string;
};

export type CampaignAction = {
  action: string;
  optimizationFocus: string;
  expectedLift: string;
  notes: string;
  governanceNotes: string;
};

export type CampaignRecommendation =
  | "scale"
  | "reduce"
  | "pause"
  | "retarget"
  | "test new creative";

export type CampaignTrendPoint = {
  week: string;
  cac: number;
  conversionRate: number;
  kycCompletion: number;
};

export type CampaignPerformance = {
  id: string;
  name: string;
  audience: string;
  segment: string;
  creativeTheme: string;
  creativeThemeDescription: string;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  conversionRate: number;
  kycCompletion: number;
  activationRate: number;
  cac: number;
  strategicQuality: number;
  score?: number;
  recommendation?: CampaignRecommendation;
  recommendationRationale?: string;
  explanation?: string[];
  spendShare?: number;
  timeline: CampaignTrendPoint[];
};

export type CampaignMatrixCell = {
  audience: string;
  creative: string;
  effectiveness: number;
  qualitySignal: string;
};

export type CampaignSimulation = {
  optimizeFor: "lowCAC" | "highQuality";
  campaigns: CampaignPerformance[];
  totalSpend: number;
  averageCAC: number;
  averageConversion: number;
  averageKYC: number;
  budgetBefore: { channel: string; amount: number; share: number }[];
  budgetAfter: { channel: string; amount: number; share: number }[];
  audienceCreativeMatrix: CampaignMatrixCell[];
  summaryNarrative: string;
};

export type PersonalizationOutput = {
  audienceSynopsis: string;
  languageUsed: LanguagePreference;
  message: string;
};

// Content Personalization types
export type Channel = "email" | "sms" | "whatsapp" | "push";

export type PersonaCategory =
  | "salaried professional"
  | "student"
  | "merchant"
  | "premium user"
  | "self-employed";

export type ToneVariant =
  | "formal"
  | "friendly"
  | "premium"
  | "urgent-but-compliant";

export type LanguageOption = "English" | "Hindi" | "Hinglish";

export type ComplianceFlag =
  | "exaggerated-claims"
  | "misleading-urgency"
  | "unclear-offer-wording";

export type ContentTemplate = {
  id: string;
  channel: Channel;
  persona: PersonaCategory[];
  language: LanguageOption;
  tone: ToneVariant;
  subject?: string; // for email
  body: string;
  deterministicSeed?: string;
};

export type ContentVariant = {
  templateId: string;
  channel: Channel;
  language: LanguageOption;
  tone: ToneVariant;
  subject?: string;
  body: string;
  engagementScore: number; // 0-100 predicted
  conversionRelevance: number; // 0-100
  complianceFlags: ComplianceFlag[];
  explainability: string[]; // why chosen
};

export type ContentPersonalizationResult = {
  leadId: string;
  leadName: string;
  channel: Channel;
  language: LanguageOption;
  persona: PersonaCategory;
  variants: ContentVariant[]; // multiple tone variants
  genericVariant: ContentVariant; // baseline generic copy for compare
  complianceSummary: string;
};

export type OfferRecommendation = {
  recommendation: string;
  rationale: string;
  onboardingTrack: string;
  governanceLabel: string;
};

export type PolicyStatus = "policy-compliant" | "borderline" | "manual-review";

export type OfferCandidate = {
  id: string;
  name: string;
  bundle: string;
  products: string[];
  description: string;
  segmentAffinity: string[];
  minIncome?: number;
  maxIncome?: number;
  digitalAffinityMin?: number;
  requiresSalaryAccount?: boolean;
  benefitsTheme:
    | "cashback"
    | "reward"
    | "welcome incentive"
    | "security"
    | "advisory";
  policyStatus: PolicyStatus;
  fitScore: number;
  eligibility: "eligible" | "borderline" | "ineligible";
  whyThisOffer: string;
  whyNotShown: string[];
  reviewHint: string;
  manualOverride?: "approved" | "rejected" | "none";
};

export type OfferPersonalizationResult = {
  leadId: string;
  leadName: string;
  topOffers: OfferCandidate[];
  declinedOffers: OfferCandidate[];
  policySummary: string;
  explainableNote: string;
  reviewerHint: string;
  manualOverrideAction?: "approved" | "rejected" | "none";
};

export type AuditRecord = {
  id: string;
  step: string;
  decision: string;
  rationale: string;
  confidence: number;
  reviewRequired: boolean;
  assignedTo: string;
  notes: string;
  timestamp: string;
};

export type OnboardingResult = {
  status: KYCDecisionStatus;
  verificationDetails: string;
  securityHighlights: string[];
  exceptionFlags: string[];
  manualReviewPath: string;
  auditTrail: AuditRecord[];
  // Richer session metadata
  sessionId?: string;
  extractedName?: string;
  extractedDOB?: string;
  documentType?: string;
  ocrConfidence?: number; // 0-100
  faceMatchScore?: number; // 0-100
  livenessScore?: number; // 0-100
  spoofRiskFlag?: boolean;
  mismatchReason?: string;
  manualReviewNote?: string;
  sessionEvents?: AuditRecord[]; // chronological events for the session
};

export type GovernanceSummary = {
  reviewLevel: string;
  riskNote: string;
  humanOverrideRequired: boolean;
  recommendedReviewer: string;
  controlSignals: string[];
};

export type JourneyStageStatus = {
  stage: string;
  status: StageStatus;
  decisionSummary: string;
  confidence: number;
  governanceAction: string;
};

export type JourneyState = {
  currentStage: string;
  completedStages: number;
  totalStages: number;
  humanActionRequired: boolean;
};

export type TimelineStep = {
  step: string;
  detail: string;
};

export type AgentInput = Record<string, unknown>;
export type AgentOutput = Record<string, unknown>;
export type AgentExecutionStatus = "Completed" | "Pending" | "Escalated";

export type AgentExecutionResult = {
  agentName: string;
  input: AgentInput;
  output: AgentOutput;
  confidence: number;
  decision: string;
  escalated: boolean;
  reasoningSummary: string;
  auditLogId: string;
  status: AgentExecutionStatus;
  timestamp: string;
};

export type AcquisitionReport = {
  selectedLeadId: string;
  selectedLeadName: string;
  selectedLeadSegment: LeadSegment;
  outcomeSummary: string;
  primarySegment: LeadSegment;
  leads: LeadProfile[];
  strategy: AcquisitionStrategy;
  campaign: CampaignAction;
  personalization: PersonalizationOutput;
  offer: OfferRecommendation;
  onboarding: OnboardingResult;
  governance: GovernanceSummary;
  auditLog: AuditRecord[];
  stageStatuses: JourneyStageStatus[];
  timeline: TimelineStep[];
  journeyState: JourneyState;
};

export type AgentFlowReport = AcquisitionReport & {
  executionId: string;
  startedAt: string;
  finishedAt: string;
  agentResults: AgentExecutionResult[];
};

export type ManualOverride = {
  id: string;
  overriddenField: "offer" | "kyc" | "budget" | "escalation";
  originalDecision: string;
  overriddenDecision: string;
  reason: string;
  overriddenBy: string;
  timestamp: string;
  approvalStatus: "pending" | "approved" | "rejected";
  approvedBy?: string;
  auditNotes?: string;
};

export type DecisionReceipt = {
  receiptId: string;
  leadId: string;
  leadName: string;
  executionId: string;
  journeyOutcome: "approved" | "rejected" | "manual_review" | "escalated";
  decisionSummary: string;
  keyFactors: string[];
  confidence: number;
  governanceStatus: "passed" | "flagged" | "escalated";
  overrides: ManualOverride[];
  timestamp: string;
  validUntil: string;
  reviewedBy?: string;
  approvalSignature?: string;
};
