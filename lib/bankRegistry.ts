export interface BankConfig {
  id: string;
  name: string;
  fullName: string;
  tagline: string;
  theme: "sbi" | "apex" | "horizon" | "stellar";
  products: {
    "Urban Growth": string;
    "Premium Emerging": string;
    "SME Catalyst": string;
    "Digital Saver": string;
    "Wealth Builder": string;
  };
}

export const bankRegistry: Record<string, BankConfig> = {
  sbi: {
    id: "sbi",
    name: "SBI",
    fullName: "State Bank of India",
    tagline: "The Banker to Every Indian",
    theme: "sbi",
    products: {
      "Urban Growth": "SBI Smart Savings + Lifestyle Credit Card",
      "Premium Emerging": "SBI Salary Plus Account + Starter Credit Card",
      "SME Catalyst": "SBI Merchant Current Account + QR Onboarding",
      "Digital Saver": "SBI Digital Saver Account + Cashback Debit",
      "Wealth Builder": "SBI Wealth Builder Portfolio + Advisory Suite",
    },
  },
  apex: {
    id: "apex",
    name: "Apex Bank",
    fullName: "Apex Retail & Commercial Bank",
    tagline: "Peak Financial Engineering",
    theme: "apex",
    products: {
      "Urban Growth": "Apex Smart Savings + Lifestyle Card",
      "Premium Emerging": "Apex Salary Premium Account + Platinum Card",
      "SME Catalyst": "Apex Merchant Business Account + Instant QR",
      "Digital Saver": "Apex Pulse Digital Saver + Neo Debit Card",
      "Wealth Builder": "Apex Elite Asset Builder + Advisory Suite",
    },
  },
  horizon: {
    id: "horizon",
    name: "Horizon Bank",
    fullName: "Horizon Capital Bank",
    tagline: "Navigating Your Future Wealth",
    theme: "horizon",
    products: {
      "Urban Growth": "Horizon Active Savings Account + Rewards Card",
      "Premium Emerging": "Horizon Executive Salary + Elite Credit Card",
      "SME Catalyst": "Horizon Commercial Current + Smart Terminal",
      "Digital Saver": "Horizon HorizonGo Savings + Cashback Debit",
      "Wealth Builder": "Horizon Pinnacle Wealth Management + Custom Suite",
    },
  },
  stellar: {
    id: "stellar",
    name: "Stellar Bank",
    fullName: "Stellar Digital Bank",
    tagline: "Banking for the Next Generation",
    theme: "stellar",
    products: {
      "Urban Growth": "Stellar Smart Saver + Neo Cashback Card",
      "Premium Emerging": "Stellar Executive Account + Platinum Credit",
      "SME Catalyst": "Stellar MSME BizAccount + Payment Gateway",
      "Digital Saver": "Stellar Zero Saver + Digital Debit Card",
      "Wealth Builder": "Stellar Private Wealth + Smart Advisory Suite",
    },
  },
};

export function getBankConfig(bankId?: string): BankConfig {
  if (!bankId || !bankRegistry[bankId]) {
    return bankRegistry.sbi; // fallback to sbi
  }
  return bankRegistry[bankId];
}
