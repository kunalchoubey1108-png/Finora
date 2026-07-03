import type { CampaignPerformance, CampaignMatrixCell } from "../lib/types";

export const syntheticCampaigns: CampaignPerformance[] = [
  {
    id: "C-001",
    name: "Digital Growth Push",
    audience: "Young Urban Savers",
    segment: "Urban Growth",
    creativeTheme: "Reward-led mobile activation",
    creativeThemeDescription:
      "Emphasizes cashback and instant debit benefits for mobile-first salaried professionals.",
    spend: 610000,
    impressions: 1140000,
    clicks: 98000,
    conversions: 11400,
    conversionRate: 0.1,
    kycCompletion: 78,
    activationRate: 58,
    cac: 535,
    strategicQuality: 72,
    timeline: [
      { week: "W1", cac: 570, conversionRate: 0.09, kycCompletion: 74 },
      { week: "W2", cac: 540, conversionRate: 0.1, kycCompletion: 77 },
      { week: "W3", cac: 520, conversionRate: 0.11, kycCompletion: 80 },
      { week: "W4", cac: 535, conversionRate: 0.1, kycCompletion: 78 },
    ],
  },
  {
    id: "C-002",
    name: "SME Trust Accelerator",
    audience: "SME Operators",
    segment: "SME Catalyst",
    creativeTheme: "Compliance-first working capital offer",
    creativeThemeDescription:
      "Focuses on auditing, cash flow protection, and digital invoicing confidence for growing businesses.",
    spend: 820000,
    impressions: 640000,
    clicks: 52000,
    conversions: 4220,
    conversionRate: 0.08,
    kycCompletion: 84,
    activationRate: 66,
    cac: 820,
    strategicQuality: 88,
    timeline: [
      { week: "W1", cac: 860, conversionRate: 0.08, kycCompletion: 81 },
      { week: "W2", cac: 830, conversionRate: 0.08, kycCompletion: 83 },
      { week: "W3", cac: 790, conversionRate: 0.09, kycCompletion: 85 },
      { week: "W4", cac: 820, conversionRate: 0.08, kycCompletion: 84 },
    ],
  },
  {
    id: "C-003",
    name: "Premium Portfolio Launch",
    audience: "Affluent Professionals",
    segment: "Premium Emerging",
    creativeTheme: "Advisory-led wealth invitation",
    creativeThemeDescription:
      "Premium digital onboarding with wealth advisory and tax planning confidence.",
    spend: 1240000,
    impressions: 330000,
    clicks: 19000,
    conversions: 1140,
    conversionRate: 0.06,
    kycCompletion: 92,
    activationRate: 74,
    cac: 1088,
    strategicQuality: 94,
    timeline: [
      { week: "W1", cac: 1130, conversionRate: 0.06, kycCompletion: 90 },
      { week: "W2", cac: 1100, conversionRate: 0.06, kycCompletion: 91 },
      { week: "W3", cac: 1060, conversionRate: 0.07, kycCompletion: 93 },
      { week: "W4", cac: 1088, conversionRate: 0.06, kycCompletion: 92 },
    ],
  },
  {
    id: "C-004",
    name: "Trust Retargeting",
    audience: "Digital Natives",
    segment: "Digital Saver",
    creativeTheme: "Security and speed retargeting",
    creativeThemeDescription:
      "Re-engages warm digital prospects with trust signals and faster activation paths.",
    spend: 470000,
    impressions: 880000,
    clicks: 71000,
    conversions: 6360,
    conversionRate: 0.09,
    kycCompletion: 88,
    activationRate: 70,
    cac: 740,
    strategicQuality: 82,
    timeline: [
      { week: "W1", cac: 760, conversionRate: 0.09, kycCompletion: 86 },
      { week: "W2", cac: 735, conversionRate: 0.09, kycCompletion: 87 },
      { week: "W3", cac: 712, conversionRate: 0.1, kycCompletion: 89 },
      { week: "W4", cac: 740, conversionRate: 0.09, kycCompletion: 88 },
    ],
  },
  {
    id: "C-005",
    name: "Scale Saver Acquisition",
    audience: "Mass Urban Salaried",
    segment: "Urban Growth",
    creativeTheme: "Value-based savings funnel",
    creativeThemeDescription:
      "Targets a broad salaried audience with low-cost digital savings offers and a streamlined KYC path.",
    spend: 930000,
    impressions: 1010000,
    clicks: 93000,
    conversions: 8370,
    conversionRate: 0.085,
    kycCompletion: 70,
    activationRate: 55,
    cac: 111, // deliberately low because of broad funnel
    strategicQuality: 68,
    timeline: [
      { week: "W1", cac: 118, conversionRate: 0.08, kycCompletion: 68 },
      { week: "W2", cac: 112, conversionRate: 0.09, kycCompletion: 70 },
      { week: "W3", cac: 108, conversionRate: 0.09, kycCompletion: 71 },
      { week: "W4", cac: 111, conversionRate: 0.085, kycCompletion: 70 },
    ],
  },
];

export const audienceCreativeMatrix: CampaignMatrixCell[] = [
  {
    audience: "Young Urban Savers",
    creative: "Reward-led mobile activation",
    effectiveness: 72,
    qualitySignal:
      "Strong conversion but moderate activation; good for low-cost scale.",
  },
  {
    audience: "Young Urban Savers",
    creative: "Trust & compliance storytelling",
    effectiveness: 84,
    qualitySignal:
      "Better KYC flow and higher activation when banking confidence is emphasized.",
  },
  {
    audience: "Young Urban Savers",
    creative: "Wealth advisory premium",
    effectiveness: 58,
    qualitySignal:
      "Less relevant for low-cost, volume-focused savings acquisition.",
  },
  {
    audience: "SME Operators",
    creative: "Compliance-first working capital offer",
    effectiveness: 91,
    qualitySignal:
      "Highest quality for SME onboarding; trusted segmentation supports activation.",
  },
  {
    audience: "SME Operators",
    creative: "Cashflow reassurance",
    effectiveness: 82,
    qualitySignal:
      "Strong KYC and value signal when paired with audit-ready messaging.",
  },
  {
    audience: "SME Operators",
    creative: "Aggressive growth push",
    effectiveness: 64,
    qualitySignal:
      "Higher conversion nominally, but lower KYC completion and activation risk.",
  },
  {
    audience: "Affluent Professionals",
    creative: "Advisory-led wealth invitation",
    effectiveness: 89,
    qualitySignal:
      "Premium segment requires high-trust creative to convert and activate.",
  },
  {
    audience: "Affluent Professionals",
    creative: "Luxury lifestyle promise",
    effectiveness: 76,
    qualitySignal:
      "Good interest but lower KYC follow-through unless credibility is emphasized.",
  },
  {
    audience: "Affluent Professionals",
    creative: "Digital convenience pitch",
    effectiveness: 67,
    qualitySignal:
      "Useful for awareness, but weaker for activation-driven premium outcomes.",
  },
];
