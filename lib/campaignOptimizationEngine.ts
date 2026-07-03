import { syntheticCampaigns, audienceCreativeMatrix } from "../data/campaigns";
import type {
  CampaignPerformance,
  CampaignRecommendation,
  CampaignSimulation,
  CampaignTrendPoint,
} from "./types";

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

const normalizePct = (value: number) => clamp(Math.round(value * 100), 0, 100);

const cacScore = (cac: number) =>
  clamp(Math.round(120 - (cac - 300) / 10), 0, 100);
const conversionScore = (conversionRate: number) =>
  clamp(Math.round(conversionRate * 550), 0, 100);

const recommendationLabel: Record<CampaignRecommendation, string> = {
  scale: "Scale",
  reduce: "Reduce",
  pause: "Pause",
  retarget: "Retarget",
  "test new creative": "Test new creative",
};

function chooseRecommendation(
  campaign: CampaignPerformance,
  optimizeFor: CampaignSimulation["optimizeFor"],
): CampaignRecommendation {
  if (campaign.cac > 900 && campaign.conversionRate < 0.08) return "pause";
  if (campaign.kycCompletion < 70 || campaign.activationRate < 60)
    return campaign.cac < 650 ? "test new creative" : "retarget";
  if (campaign.strategicQuality >= 85 && campaign.cac <= 900) return "scale";
  if (campaign.cac > 800 && campaign.strategicQuality >= 70) return "reduce";
  return "test new creative";
}

function explainRecommendation(
  campaign: CampaignPerformance,
  recommendation: CampaignRecommendation,
  optimizeFor: CampaignSimulation["optimizeFor"],
) {
  const base: string[] = [];
  const lowCostFocus =
    optimizeFor === "lowCAC"
      ? "The optimization target values cost efficiency and scale."
      : "The optimization target values high-quality, activated customers. ";

  base.push(
    lowCostFocus.trim(),
    `Campaign ${campaign.name} has CAC ₹${campaign.cac.toLocaleString()} and strategic quality ${campaign.strategicQuality}%.`,
  );

  if (recommendation === "scale") {
    base.push(
      `High-quality outcomes with activation ${campaign.activationRate}% and KYC completion ${campaign.kycCompletion}% support expansion.`,
    );
  }
  if (recommendation === "reduce") {
    base.push(
      `Campaign shows solid quality but needs tighter spend because CAC is elevated relative to portfolio targets.`,
    );
  }
  if (recommendation === "pause") {
    base.push(
      `Low conversion and high CAC make this campaign a poor fit for business-outcome optimization.`,
    );
  }
  if (recommendation === "retarget") {
    base.push(
      `KYC completion or activation are the main friction points that should be addressed before adding more spend.`,
    );
  }
  if (recommendation === "test new creative") {
    base.push(
      `Creative plus audience fit should be refined; the current assets are not unlocking activation efficiently.`,
    );
  }

  return base;
}

function scoreCampaign(
  campaign: CampaignPerformance,
  optimizeFor: CampaignSimulation["optimizeFor"],
) {
  const cac = cacScore(campaign.cac);
  const conversion = conversionScore(campaign.conversionRate);
  const kyc = campaign.kycCompletion;
  const activation = campaign.activationRate;
  const strategic = campaign.strategicQuality;

  const weights =
    optimizeFor === "lowCAC"
      ? {
          cac: 0.36,
          conversion: 0.26,
          kyc: 0.14,
          activation: 0.12,
          strategic: 0.12,
        }
      : {
          cac: 0.18,
          conversion: 0.2,
          kyc: 0.24,
          activation: 0.22,
          strategic: 0.16,
        };

  const score = clamp(
    Math.round(
      cac * weights.cac +
        conversion * weights.conversion +
        kyc * weights.kyc +
        activation * weights.activation +
        strategic * weights.strategic,
    ),
    0,
    100,
  );

  const recommendation = chooseRecommendation(campaign, optimizeFor);
  const rationale = explainRecommendation(
    campaign,
    recommendation,
    optimizeFor,
  );
  const explanation = [
    `CAC trend has averaged ₹${Math.round(
      campaign.timeline.reduce(
        (sum: number, point: CampaignTrendPoint) => sum + point.cac,
        0,
      ) / campaign.timeline.length,
    )}.`,
    `Activation is ${campaign.activationRate}% while KYC completion is ${campaign.kycCompletion}%.`,
    `Strategic segment quality is ${campaign.strategicQuality}%.`,
  ];

  return {
    ...campaign,
    score,
    recommendation,
    recommendationRationale: recommendationLabel[recommendation],
    explanation,
  };
}

function allocateBudget(
  campaigns: CampaignPerformance[],
  expandFactor: number,
  reduceFactor: number,
) {
  const totals = campaigns.reduce<number>((acc, item) => acc + item.spend, 0);
  return campaigns.map((item) => {
    const weight =
      item.recommendation === "scale"
        ? expandFactor
        : item.recommendation === "reduce"
          ? reduceFactor
          : item.recommendation === "pause"
            ? 0.55
            : 0.92;
    const adjusted = Math.round(item.spend * weight);
    return {
      channel: `${item.audience} / ${item.creativeTheme}`,
      amount: adjusted,
      raw: adjusted,
      original: item.spend,
    };
  });
}

function normalizeBudget(
  budgets: { channel: string; amount: number; raw: number; original: number }[],
) {
  const total = budgets.reduce<number>((sum, item) => sum + item.raw, 0);
  return budgets.map((item) => ({
    channel: item.channel,
    amount: Math.round(
      (item.raw / total) *
        budgets.reduce<number>((sum, row) => sum + row.original, 0),
    ),
    share: Math.round((item.raw / total) * 100),
  }));
}

export function generateCampaignSimulation(
  optimizeFor: CampaignSimulation["optimizeFor"],
): CampaignSimulation {
  const campaigns = syntheticCampaigns.map((campaign) =>
    scoreCampaign(campaign, optimizeFor),
  );
  const totalSpend = campaigns.reduce(
    (sum, campaign) => sum + campaign.spend,
    0,
  );
  const averageCAC = Math.round(
    campaigns.reduce((sum, campaign) => sum + campaign.cac, 0) /
      campaigns.length,
  );
  const averageConversion = Number(
    (
      campaigns.reduce((sum, campaign) => sum + campaign.conversionRate, 0) /
      campaigns.length
    ).toFixed(3),
  );
  const averageKYC = Math.round(
    campaigns.reduce((sum, campaign) => sum + campaign.kycCompletion, 0) /
      campaigns.length,
  );

  const budgetBefore = campaigns.map((campaign) => ({
    channel: `${campaign.audience} / ${campaign.creativeTheme}`,
    amount: campaign.spend,
    share: Math.round((campaign.spend / totalSpend) * 100),
  }));

  const rawAfter = allocateBudget(campaigns, 1.25, 0.78);
  const budgetAfter = normalizeBudget(rawAfter);

  const summaryNarrative =
    optimizeFor === "lowCAC"
      ? "This simulation prioritizes campaign efficiency, lowering average CAC while maintaining volume across lower-cost audiences."
      : "This simulation prioritizes high-quality activated customers, shifting spend to campaigns with stronger KYC and activation outcomes. ";

  return {
    optimizeFor,
    campaigns,
    totalSpend,
    averageCAC,
    averageConversion,
    averageKYC,
    budgetBefore,
    budgetAfter,
    audienceCreativeMatrix,
    summaryNarrative,
  };
}
