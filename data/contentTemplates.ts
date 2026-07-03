import type { ContentTemplate } from "../lib/types";

// Seeded deterministic templates. Keep language native phrasing simple and compliant.
export const contentTemplates: ContentTemplate[] = [
  // Email - Salaried - English
  {
    id: "T-EMAIL-SALARIED-EN-FORMAL",
    channel: "email",
    persona: ["salaried professional"],
    language: "English",
    tone: "formal",
    subject: "Secure your SBI savings benefits — personalised for you",
    body: `Dear {name},

Based on your profile, SBI recommends an optimised savings package that provides secure digital onboarding and meaningful rewards. Our recommendation prioritises transactional security and clear benefits, including cashback on select spend categories.

If you would like to proceed, we will guide you through an audit-ready digital KYC process.

Regards,
SBI Customer Services`,
    deterministicSeed: "seed-1",
  },

  // SMS - Student - Hinglish - Friendly
  {
    id: "T-SMS-STUDENT-HING-FRIENDLY",
    channel: "sms",
    persona: ["student"],
    language: "Hinglish",
    tone: "friendly",
    body: `Hi {name}! SBI ke naye Student Savings account mein sign up karo aur pao instant rewards. Easy KYC aur student benefits await you. Reply YES to start.`,
    deterministicSeed: "seed-2",
  },

  // WhatsApp - Merchant - English - Urgent-but-compliant
  {
    id: "T-WA-MERCHANT-EN-URGENT",
    channel: "whatsapp",
    persona: ["merchant"],
    language: "English",
    tone: "urgent-but-compliant",
    body: `Hello {name},

Important: Strengthen your business payments with SBI's Merchant Current Account. Immediate QR onboarding can increase transaction certainty. This message is informational; see details before proceeding.`,
    deterministicSeed: "seed-3",
  },

  // Push - Premium - Hindi - Premium tone
  {
    id: "T-PUSH-PREMIUM-HI-PREMIUM",
    channel: "push",
    persona: ["premium user"],
    language: "Hindi",
    tone: "premium",
    body: `Namaste {name}, aapke liye SBI ki vishesh advisory aur wealth bundle uplabdh hai. Personal advisor se baat karne ke liye app mein visit karein.`,
    deterministicSeed: "seed-4",
  },

  // Email - Self-employed - English - Friendly
  {
    id: "T-EMAIL-SELFEN-FRIENDLY",
    channel: "email",
    persona: ["self-employed"],
    language: "English",
    tone: "friendly",
    subject: "Tools for your business banking — quick setup with SBI",
    body: `Hi {name},

We designed an account bundle to simplify invoicing and cashflow for independent professionals. Enjoy tailored onboarding steps, QR acceptance, and working capital guidance.

Cheers,
SBI Business Support`,
    deterministicSeed: "seed-5",
  },
];
