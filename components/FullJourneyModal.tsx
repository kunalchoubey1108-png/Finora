"use client";

import React, { useEffect, useMemo, useState } from "react";
import type { LeadProfile } from "../lib/types";
import { useBank } from "./BankContext";

// Simple deterministic RNG (mulberry32)
function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const SAMPLE_LEADS: LeadProfile[] = [
  {
    id: "lead_premium_1",
    name: "Asha Mehta",
    city: "Mumbai",
    cityTier: "metro",
    region: "West",
    age: 42,
    income: 220000,
    digitalAffinity: 88,
    digitalComfort: 82,
    preferredChannel: "email",
    onboardingPath: "rm-assisted",
    preferredLanguage: "English",
    persona: {
      title: "Wealth Builder",
      archetype: "Advisor-led",
      motivation: "Investment",
    },
    previousProducts: ["Savings", "Investments"],
    segment: "Wealth Builder",
    challengeSummary: "High touch onboarding with advisory",
    riskSignals: [],
    governanceFlags: [],
    regulatoryNotes: "High net worth — senior review required",
    score: {
      conversionProbability: 84,
      productFit: 92,
      onboardingConfidence: 90,
      confidence: 88,
      businessValue: 480000,
      complianceRisk: 22,
      decisionGrade: "A",
    },
  },
  {
    id: "lead_urban_1",
    name: "Ramesh Kumar",
    city: "Bengaluru",
    cityTier: "metro",
    region: "South",
    age: 31,
    income: 62000,
    digitalAffinity: 78,
    digitalComfort: 76,
    preferredChannel: "whatsapp",
    onboardingPath: "self-serve",
    preferredLanguage: "English",
    persona: {
      title: "Urban Growth",
      archetype: "Young Professional",
      motivation: "Convenience",
    },
    previousProducts: ["Savings"],
    segment: "Urban Growth",
    challengeSummary: "Mobile-first onboarding",
    riskSignals: [],
    governanceFlags: [],
    regulatoryNotes: "",
    score: {
      conversionProbability: 72,
      productFit: 68,
      onboardingConfidence: 84,
      confidence: 75,
      businessValue: 98000,
      complianceRisk: 38,
      decisionGrade: "B",
    },
  },
  {
    id: "lead_sme_1",
    name: "Sangeeta Roy",
    city: "Kolkata",
    cityTier: "tier-2",
    region: "East",
    age: 39,
    income: 180000,
    digitalAffinity: 64,
    digitalComfort: 54,
    preferredChannel: "sms",
    onboardingPath: "branch-assisted",
    preferredLanguage: "English",
    persona: {
      title: "SME Owner",
      archetype: "SME Catalyst",
      motivation: "Growth",
    },
    previousProducts: ["Business Account"],
    segment: "SME Catalyst",
    challengeSummary: "Document-heavy onboarding",
    riskSignals: ["Company mismatch"],
    governanceFlags: [],
    regulatoryNotes: "Requires documentary review for business entity",
    score: {
      conversionProbability: 68,
      productFit: 74,
      onboardingConfidence: 76,
      confidence: 72,
      businessValue: 210000,
      complianceRisk: 58,
      decisionGrade: "B",
    },
  },
  {
    id: "lead_student_1",
    name: "Priya Sharma",
    city: "Jaipur",
    cityTier: "tier-2",
    region: "North",
    age: 22,
    income: 12000,
    digitalAffinity: 92,
    digitalComfort: 90,
    preferredChannel: "whatsapp",
    onboardingPath: "self-serve",
    preferredLanguage: "Hindi",
    persona: {
      title: "Student Starter",
      archetype: "Student",
      motivation: "Savings",
    },
    previousProducts: [],
    segment: "Digital Saver",
    challengeSummary: "Low-income mobile-first",
    riskSignals: [],
    governanceFlags: [],
    regulatoryNotes: "",
    score: {
      conversionProbability: 62,
      productFit: 56,
      onboardingConfidence: 82,
      confidence: 67,
      businessValue: 18000,
      complianceRisk: 20,
      decisionGrade: "C",
    },
  },
];

type StepKey =
  | "lead"
  | "scoring"
  | "strategy"
  | "campaign"
  | "offer"
  | "personalization"
  | "kyc"
  | "outcome";

export function FullJourneyModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { activeBank } = useBank();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [running, setRunning] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const steps: StepKey[] = useMemo(
    () => [
      "lead",
      "scoring",
      "strategy",
      "campaign",
      "offer",
      "personalization",
      "kyc",
      "outcome",
    ],
    [],
  );
  const lead = SAMPLE_LEADS[selectedIndex];

  // deterministic RNG seeded by lead id
  const seed = useMemo(() => {
    let s = 0;
    for (let i = 0; i < lead.id.length; i++) s = s * 31 + lead.id.charCodeAt(i);
    return s >>> 0;
  }, [lead.id]);

  const rng = useMemo(() => mulberry32(seed), [seed]);

  // animated counters
  const [cac, setCac] = useState(0);
  const [convProb, setConvProb] = useState(0);
  const [kycProb, setKycProb] = useState(0);
  const [activation, setActivation] = useState(0);

  useEffect(() => {
    if (!running) return;
    setStepIndex(0);
    let idx = 0;
    const interval = setInterval(() => {
      idx++;
      setStepIndex(Math.min(idx, steps.length - 1));
      if (idx >= steps.length - 1) {
        clearInterval(interval);
        setRunning(false);
      }
    }, 1400);
    return () => clearInterval(interval);
  }, [running, steps.length]);

  useEffect(() => {
    if (!running) return;
    // animate counters towards deterministic targets
    const targetCac = Math.round(500 + rng() * 800); // ₹
    const targetConv = Math.round(50 + rng() * 45); // %
    const targetKyc = Math.round(60 + rng() * 38); // %
    const targetActivation = Math.round(30 + rng() * 60); // %

    let t = 0;
    const stepsAnim = 60;
    const anim = setInterval(() => {
      t++;
      const p = t / stepsAnim;
      setCac(Math.round(targetCac * p));
      setConvProb(Math.round(targetConv * p));
      setKycProb(Math.round(targetKyc * p));
      setActivation(Math.round(targetActivation * p));
      if (t >= stepsAnim) clearInterval(anim);
    }, 24);

    return () => clearInterval(anim);
  }, [running, rng]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-[92%] max-w-6xl rounded-2xl bg-white p-6 shadow-2xl text-slate-900">
        <div className="flex items-start justify-between">
          <h2 className="text-xl font-semibold">
            Run Full Journey — Cinematic Simulation
          </h2>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-3 py-1 border rounded">
              Close
            </button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-6">
          <div className="col-span-1">
            <h3 className="font-medium">Select Lead</h3>
            <div className="mt-3 space-y-2">
              {SAMPLE_LEADS.map((l, i) => (
                <button
                  key={l.id}
                  onClick={() => setSelectedIndex(i)}
                  className={`w-full text-left p-3 rounded ${i === selectedIndex ? "bg-sky-100" : "bg-gray-50"}`}
                >
                  <div className="font-semibold">{l.name}</div>
                  <div className="text-sm text-gray-600">
                    {l.segment} · {l.city}
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-6 p-3 rounded bg-gray-50">
              <p className="text-sm text-gray-600">Counters</p>
              <div className="mt-2 grid gap-2">
                <div className="flex justify-between">
                  <span>Projected CAC</span>
                  <strong>₹{cac.toLocaleString()}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Conversion Prob.</span>
                  <strong>{convProb}%</strong>
                </div>
                <div className="flex justify-between">
                  <span>KYC Completion</span>
                  <strong>{kycProb}%</strong>
                </div>
                <div className="flex justify-between">
                  <span>Projected Activation</span>
                  <strong>{activation}%</strong>
                </div>
              </div>
            </div>
          </div>

          <div className="col-span-2">
            <div className="h-64 rounded-lg border bg-gradient-to-br from-sky-50 to-white p-6 flex flex-col justify-between">
              <div>
                <div className="text-sm text-gray-500">Step</div>
                <div className="mt-2 text-2xl font-semibold">
                  {steps[stepIndex]}
                </div>
                <div className="mt-4 text-sm text-gray-700">
                  Lead: <strong>{lead.name}</strong> — {lead.segment} ·{" "}
                  {lead.city}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  {steps[stepIndex] === "scoring" && (
                    <div>
                      <p className="text-sm text-gray-600">
                        Scoring complete — grade{" "}
                        <strong>{lead.score.decisionGrade}</strong>
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        Top reasons: business value, digital affinity
                      </p>
                    </div>
                  )}
                  {steps[stepIndex] === "strategy" && (
                    <div>
                      <p className="text-sm text-gray-600">
                        Strategy selected: Governance-aware growth plan
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        Channels: Priority + Digital mix
                      </p>
                    </div>
                  )}
                  {steps[stepIndex] === "campaign" && (
                    <div>
                      <p className="text-sm text-gray-600">
                        Campaign action: Refine targeting and prioritize
                        high-value segments
                      </p>
                    </div>
                  )}
                  {steps[stepIndex] === "offer" && (
                    <div>
                      <p className="text-sm text-gray-600">
                        Offer chosen:{" "}
                        {activeBank.products[lead.segment] || "Savings Account"}
                      </p>
                    </div>
                  )}
                  {steps[stepIndex] === "personalization" && (
                    <div>
                      <p className="text-sm text-gray-600">Message preview:</p>
                      <div className="mt-2 p-3 rounded bg-white text-sm border">
                        Hi {lead.name}, {activeBank.name} has prepared a tailored onboarding
                        for you.
                      </div>
                    </div>
                  )}
                  {steps[stepIndex] === "kyc" && (
                    <div>
                      <p className="text-sm text-gray-600">
                        KYC: Video session initiated — running biometric & OCR
                        checks
                      </p>
                    </div>
                  )}
                  {steps[stepIndex] === "outcome" && (
                    <div>
                      <p className="text-sm text-gray-600">
                        Final outcome:{" "}
                        {convProb > 60 && kycProb > 60
                          ? "Approved"
                          : "Manual Review"}
                      </p>
                    </div>
                  )}
                </div>

                <div className="text-right">
                  <div className="text-sm text-gray-500">Progress</div>
                  <div className="mt-2 text-lg font-semibold">
                    {Math.round(((stepIndex + 1) / steps.length) * 100)}%
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => {
                  setRunning(true);
                  setTimeout(() => {}, 0);
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded"
              >
                Run Simulation
              </button>
              <button
                onClick={() => {
                  setRunning(false);
                  setStepIndex(0);
                  setCac(0);
                  setConvProb(0);
                  setKycProb(0);
                  setActivation(0);
                }}
                className="px-4 py-2 border rounded"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 rounded border bg-gray-50">
          <h3 className="font-semibold">Journey Summary</h3>
          <div className="mt-2 grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Selected Lead</p>
              <p className="font-medium">
                {lead.name} · {lead.segment}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Governance</p>
              <p className="font-medium">Receipt recorded · Audit-ready</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Final CAC</p>
              <p className="font-medium">₹{cac.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Journey Outcome</p>
              <p className="font-medium">
                {convProb > 60 && kycProb > 60 ? "Approved" : "Manual Review"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FullJourneyModal;
