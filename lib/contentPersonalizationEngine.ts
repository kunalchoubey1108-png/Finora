import { contentTemplates } from "../data/contentTemplates";
import { getBankConfig } from "./bankRegistry";
import type {
  LeadProfile,
  ContentPersonalizationResult,
  ContentVariant,
  Channel,
  ToneVariant,
  LanguageOption,
  PersonaCategory,
  ComplianceFlag,
} from "./types";

function seedRandom(seed: string) {
  // Deterministic pseudo-random for demo (LCG)
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h += 0x6d2b79f5;
    let t = Math.imul(h ^ (h >>> 15), 1 | h);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function predictEngagement(templateSeed: string, lead: LeadProfile) {
  const rnd = seedRandom(templateSeed);
  const base =
    40 + Math.round(lead.digitalAffinity * 0.3) + Math.round(rnd() * 30);
  return Math.min(100, Math.max(0, base));
}

function predictRelevance(templateSeed: string, lead: LeadProfile) {
  const rnd = seedRandom(templateSeed + "rev");
  const personaBonus = lead.persona.title ? 10 : 0;
  const base =
    30 +
    Math.round(lead.score.businessValue / 20000) +
    personaBonus +
    Math.round(rnd() * 25);
  return Math.min(100, Math.max(0, base));
}

function checkCompliance(body: string): ComplianceFlag[] {
  const flags: ComplianceFlag[] = [];
  const lower = body.toLowerCase();
  if (/(guarantee|guaranteed|surefire|no-risk)/.test(lower))
    flags.push("exaggerated-claims");
  if (
    /act now|limited time|hurry|urgent/.test(lower) &&
    !/informational|see details|terms/.test(lower)
  )
    flags.push("misleading-urgency");
  if (/(free|zero cost)\b/.test(lower) && !/terms|conditions/.test(lower))
    flags.push("unclear-offer-wording");
  return flags;
}

function renderTemplate(body: string, lead: LeadProfile, bankName: string) {
  return body
    .replace(/{name}/g, lead.name)
    .replace(/{city}/g, lead.city || "your city")
    .replace(/{bank}/g, bankName);
}

function findTemplate(
  channel: Channel,
  persona: PersonaCategory,
  language: LanguageOption,
  tone: ToneVariant,
) {
  const found = contentTemplates.find(
    (t) =>
      t.channel === channel &&
      t.language === language &&
      t.tone === tone &&
      t.persona.includes(persona),
  );
  if (found) return found;
  // fallback: same channel & language
  return (
    contentTemplates.find(
      (t) => t.channel === channel && t.language === language,
    ) || contentTemplates[0]
  );
}

export function generateContentVariants(
  lead: LeadProfile,
  channel: Channel,
  language: LanguageOption,
  persona: PersonaCategory,
  bankId?: string,
): ContentPersonalizationResult {
  const bank = getBankConfig(bankId);
  const bankName = bank.name;

  const tones: ToneVariant[] = [
    "formal",
    "friendly",
    "premium",
    "urgent-but-compliant",
  ];

  const variants: ContentVariant[] = tones.map((tone) => {
    const template = findTemplate(
      channel,
      persona,
      language,
      tone as ToneVariant,
    );
    const body = renderTemplate(template.body, lead, bankName);
    const subject = template.subject
      ? template.subject.replace(/{name}/g, lead.name).replace(/{bank}/g, bankName)
      : undefined;
    const seed = (template.deterministicSeed || template.id) + "|" + tone;
    const engagementScore = predictEngagement(seed, lead);
    const conversionRelevance = predictRelevance(seed, lead);
    const complianceFlags = checkCompliance(body);
    const explainability: string[] = [];
    if (lead.digitalAffinity > 80)
      explainability.push(
        "High digital affinity supports app-first messaging.",
      );
    if (lead.score.businessValue > 150000)
      explainability.push("High business value makes premium offers relevant.");
    if (complianceFlags.length > 0)
      explainability.push("Compliance flags detected that require review.");

    return {
      templateId: template.id,
      channel,
      language,
      tone: tone as ToneVariant,
      subject,
      body,
      engagementScore,
      conversionRelevance,
      complianceFlags,
      explainability,
    };
  });

  // Generic baseline: a neutral template (choose first matching channel)
  const genericTemplate =
    contentTemplates.find((t) => t.channel === channel) || contentTemplates[0];
  const genericBody = renderTemplate(genericTemplate.body, lead, bankName);
  const genericSeed =
    (genericTemplate.deterministicSeed || genericTemplate.id) + "|generic";
  const genericVariant: ContentVariant = {
    templateId: genericTemplate.id,
    channel,
    language,
    tone: "formal",
    subject: genericTemplate.subject
      ? genericTemplate.subject.replace(/{name}/g, lead.name).replace(/{bank}/g, bankName)
      : undefined,
    body: genericBody,
    engagementScore: predictEngagement(genericSeed, lead),
    conversionRelevance: predictRelevance(genericSeed, lead),
    complianceFlags: checkCompliance(genericBody),
    explainability: ["Baseline generic copy for comparison."],
  };

  const complianceSummary = variants.some((v) => v.complianceFlags.length > 0)
    ? "Some variants include compliance flags that should be reviewed before sending."
    : "No obvious compliance flags detected for the generated variants.";

  return {
    leadId: lead.id,
    leadName: lead.name,
    channel,
    language,
    persona,
    variants,
    genericVariant,
    complianceSummary,
  };
}
