"use client";

/**
 * app/call-center/page.tsx
 *
 * CALL-E Call Center Dashboard
 * Lets operators trigger Lead Outreach, Offer Explanation, and Support calls,
 * then poll live status and view transcripts.
 */

import React, { useState, useCallback } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────
type AgentType = "outreach" | "offer-explain" | "support";

type CallRecord = {
  id: string;
  agent: AgentType;
  leadName: string;
  toPhone: string;
  runId: string | null;
  planId: string | null;
  status: string;
  summary?: string;
  transcript?: string;
  sentimentScore?: number;
  timestamp: string;
};

// ─── Demo Lead ────────────────────────────────────────────────────────────────
const DEMO_LEAD = {
  id: "lead_demo_001",
  name: "Priya Sharma",
  city: "Mumbai",
  age: 32,
  income: 75000,
  digitalAffinity: 82,
  preferredLanguage: "English",
  persona: {
    title: "Urban Professional",
    archetype: "Urban Professional",
    motivation: "Cashback & rewards",
  },
  previousProducts: ["Savings"],
  segment: "Urban Growth",
  challengeSummary: "Looking for a better credit card with cashback benefits",
  riskSignals: [],
  governanceFlags: [],
  regulatoryNotes: "",
  score: {
    conversionProbability: 82,
    productFit: 78,
    onboardingConfidence: 85,
    confidence: 82,
    businessValue: 110000,
    complianceRisk: 22,
    decisionGrade: "A" as const,
  },
};

const DEMO_OFFER_RESULT = {
  leadId: "lead_demo_001",
  leadName: "Priya Sharma",
  topOffers: [
    {
      id: "O-001",
      name: "{bank} Smart Savings + Lifestyle Credit Card",
      bundle: "Savings + Credit Bundle",
      products: ["Smart Savings Account", "Lifestyle Credit Card"],
      description: "A digital-first savings account with a rewards credit card.",
      segmentAffinity: ["Urban Growth"],
      benefitsTheme: "cashback" as const,
      policyStatus: "policy-compliant" as const,
      fitScore: 88,
      eligibility: "eligible" as const,
      whyThisOffer: "High fit for cashback-focused urban customers.",
      whyNotShown: [],
      reviewHint: "",
      manualOverride: "none" as const,
    },
  ],
  declinedOffers: [],
  policySummary: "All offers are policy-compliant.",
  explainableNote: "Top offer selected based on cashback motivation.",
  reviewerHint: "No manual review required.",
};

const DEMO_ONBOARDING = {
  status: "Manual Review" as const,
  verificationDetails: "OCR confidence below threshold — manual check recommended.",
  securityHighlights: [],
  exceptionFlags: ["OCR low confidence"],
  manualReviewPath: "",
  auditTrail: [],
  sessionId: "session_demo_001",
};

// ─── Agent colour map ─────────────────────────────────────────────────────────
const agentConfig: Record<AgentType, { label: string; description: string; emoji: string }> = {
  outreach: { label: "Lead outreach", description: "Introduce the bank and qualify interest.", emoji: "01" },
  "offer-explain": { label: "Offer explanation", description: "Explain a personalized offer after interest.", emoji: "02" },
  support: { label: "Customer support", description: "Resolve KYC and onboarding questions.", emoji: "03" },
};

// ─── Status badge colours ─────────────────────────────────────────────────────
function statusColor(s: string): string {
  if (s === "completed" || s === "succeeded") return "#10b981";
  if (s === "failed" || s === "error") return "#ef4444";
  if (s === "in_progress" || s === "running") return "#f59e0b";
  return "#6b7280";
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function CallCenterPage() {
  const [phone, setPhone] = useState("");
  const [bankId, setBankId] = useState("default");
  const [activeAgent, setActiveAgent] = useState<AgentType>("outreach");
  const [calls, setCalls] = useState<CallRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCallId, setSelectedCallId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const addCallRecord = useCallback(
    (agent: AgentType, leadName: string, toPhone: string, data: Record<string, unknown>): CallRecord => {
      const record: CallRecord = {
        id: `call_${Date.now()}`,
        agent,
        leadName,
        toPhone,
        runId: (data.runId as string) ?? null,
        planId: (data.planId as string) ?? null,
        status: (data.status as string) ?? "unknown",
        timestamp: new Date().toLocaleString(),
      };
      setCalls((prev) => [record, ...prev]);
      return record;
    },
    []
  );

  const triggerCall = useCallback(async () => {
    if (!phone) {
      setNotice("Enter a phone number in international format, for example +919876543210.");
      return;
    }
    setNotice(null);
    setLoading(true);
    try {
      let endpoint = "";
      let body: Record<string, unknown> = { toPhone: phone, bankId };

      if (activeAgent === "outreach") {
        endpoint = "/api/calls/outreach";
        body = { ...body, lead: DEMO_LEAD };
      } else if (activeAgent === "offer-explain") {
        endpoint = "/api/calls/offer-explain";
        body = { ...body, lead: DEMO_LEAD, offerResult: DEMO_OFFER_RESULT };
      } else {
        endpoint = "/api/calls/support-inbound";
        body = { ...body, lead: DEMO_LEAD, onboarding: DEMO_ONBOARDING };
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (data?.ok) {
        const record = addCallRecord(activeAgent, DEMO_LEAD.name, phone, data);
        setSelectedCallId(record.id);
        setNotice("Call request accepted. Refresh its status to retrieve live results.");
      } else {
        setNotice("Call failed: " + (data?.error ?? "Unknown error"));
      }
    } catch (e) {
      setNotice("Network error: " + String(e));
    } finally {
      setLoading(false);
    }
  }, [phone, bankId, activeAgent, addCallRecord]);

  const refreshStatus = useCallback(async (call: CallRecord) => {
    if (!call.runId) return;
    try {
      const res = await fetch(`/api/calls/call-status?runId=${call.runId}`);
      const data = await res.json();
      if (data?.ok) {
        setCalls((prev) =>
          prev.map((c) =>
            c.id === call.id
              ? {
                  ...c,
                  status: data.status ?? c.status,
                  summary: data.result?.summary ?? c.summary,
                  transcript: data.result?.transcript ?? c.transcript,
                  sentimentScore: data.result?.sentiment_score ?? c.sentimentScore,
                }
              : c
          )
        );
      }
    } catch {
      /* ignore */
    }
  }, []);

  const selected = calls.find((c) => c.id === selectedCallId) ?? null;

  return (
    <main className="editorial-page">
      <div className="editorial-container py-10 md:py-16">
        <section className="mb-10 max-w-3xl">
          <p className="editorial-eyebrow">CALL-E workspace</p>
          <h1 className="editorial-section-title mt-3">Calls with context, <em>not guesswork.</em></h1>
          <p className="editorial-subhead mt-4">Choose a governed phone agent, confirm the lead context, and follow each call through its live outcome.</p>
        </section>

        <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)_340px]">
          <section className="editorial-card h-fit p-6">
            <p className="editorial-eyebrow">New call</p>
            <h2 className="font-display mt-2 text-3xl tracking-[-0.03em]">Choose an agent.</h2>
            <div className="mt-6 space-y-2">
              {(Object.keys(agentConfig) as AgentType[]).map((agent) => (
                <button key={agent} type="button" onClick={() => setActiveAgent(agent)} className={`w-full rounded-2xl border p-4 text-left transition ${activeAgent === agent ? "border-[#17191c] bg-white" : "border-transparent bg-white/50 hover:bg-white"}`}>
                  <div className="flex items-center justify-between gap-3"><span className="text-xs text-[#979799]">{agentConfig[agent].emoji}</span><span className="text-sm font-medium text-[#17191c]">{agentConfig[agent].label}</span></div>
                  <p className="mt-2 text-sm leading-5 text-[#777b86]">{agentConfig[agent].description}</p>
                </button>
              ))}
            </div>
            <div className="mt-6 space-y-4">
              <label className="block text-sm text-[#17191c]">Lead phone number<input type="tel" placeholder="+919876543210" value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-2 w-full rounded-2xl border border-[#ececec] bg-white px-4 py-3 outline-none placeholder:text-[#a3a6af] focus:border-[#17191c]" /></label>
              <label className="block text-sm text-[#17191c]">Acquiring institution<select value={bankId} onChange={(e) => setBankId(e.target.value)} className="mt-2 w-full rounded-2xl border border-[#ececec] bg-white px-4 py-3 outline-none focus:border-[#17191c]"><option value="default">Default Bank</option><option value="sbi">State Bank of India</option><option value="apex">Apex Bank</option><option value="horizon">Horizon Bank</option><option value="stellar">Stellar Bank</option></select></label>
            </div>
            <div className="mt-6 rounded-2xl bg-[#fbe1d1] p-4 text-[#5d2a1a]"><p className="text-xs">Selected demo lead</p><p className="mt-1 font-medium">{DEMO_LEAD.name} · {DEMO_LEAD.city}</p><p className="mt-2 text-sm leading-5">{DEMO_LEAD.segment} · {DEMO_LEAD.score.conversionProbability}% conversion confidence</p></div>
            <button type="button" onClick={triggerCall} disabled={loading} className="editorial-pill editorial-pill--filled mt-6 w-full disabled:cursor-wait disabled:opacity-60">{loading ? "Starting call…" : `Start ${agentConfig[activeAgent].label}`}</button>
          </section>

          <section>
            <div className="mb-4 flex items-end justify-between"><div><p className="editorial-eyebrow">Activity</p><h2 className="font-display mt-1 text-3xl tracking-[-0.03em]">Call log</h2></div><span className="text-sm text-[#777b86]">{calls.length} {calls.length === 1 ? "call" : "calls"}</span></div>
            {notice && <p role="status" className="mb-4 rounded-2xl border border-[#ececec] bg-white px-4 py-3 text-sm leading-6 text-[#5d2a1a]">{notice}</p>}
            {calls.length === 0 ? <div className="editorial-artifact px-8 py-16 text-center"><p className="font-display text-3xl tracking-[-0.03em]">No calls yet.</p><p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[#777b86]">Select an agent, add a phone number, then start a governed call from the panel.</p></div> : <div className="space-y-3">{calls.map((call) => <article key={call.id} className={`editorial-artifact p-5 transition ${selectedCallId === call.id ? "ring-1 ring-[#17191c]" : ""}`}><button type="button" onClick={() => setSelectedCallId(call.id === selectedCallId ? null : call.id)} className="block w-full text-left"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm font-medium text-[#17191c]">{agentConfig[call.agent].label}</p><p className="mt-1 text-sm text-[#777b86]">{call.leadName} · {call.toPhone}</p></div><span className="rounded-full px-3 py-1 text-xs font-medium" style={{ color: statusColor(call.status), backgroundColor: `${statusColor(call.status)}18` }}>{call.status.replace(/_/g, " ")}</span></div><p className="mt-4 text-xs text-[#979799]">{call.timestamp}{call.runId ? ` · Run ${call.runId.slice(0, 12)}…` : ""}</p></button><button type="button" onClick={() => refreshStatus(call)} className="mt-4 text-sm text-[#17191c] hover:underline">Refresh live status →</button></article>)}</div>}
          </section>

          <aside className="editorial-card h-fit p-6 xl:sticky xl:top-24">
            <p className="editorial-eyebrow">Call detail</p>
            {selected ? <><h2 className="font-display mt-2 text-3xl tracking-[-0.03em]">{agentConfig[selected.agent].label}</h2><dl className="mt-6 space-y-4 text-sm"><Detail label="Lead" value={selected.leadName} /><Detail label="Phone" value={selected.toPhone} /><Detail label="Status" value={selected.status.replace(/_/g, " ")} color={statusColor(selected.status)} />{selected.planId && <Detail label="Plan ID" value={selected.planId} mono />}{selected.runId && <Detail label="Run ID" value={selected.runId} mono />}{selected.sentimentScore !== undefined && <Detail label="Sentiment" value={`${selected.sentimentScore}/100`} />}</dl>{selected.summary && <DetailBlock title="Summary">{selected.summary}</DetailBlock>}{selected.transcript && <DetailBlock title="Transcript"><pre className="whitespace-pre-wrap font-sans">{selected.transcript}</pre></DetailBlock>}<button type="button" onClick={() => refreshStatus(selected)} className="editorial-pill editorial-pill--ghost mt-6 w-full">Refresh status</button></> : <div className="mt-8 rounded-2xl bg-white p-5 text-sm leading-6 text-[#777b86]">Choose a call from the log to see its identifiers, status, summary, and transcript.</div>}
          </aside>
        </div>
      </div>
    </main>
  );
}

function Detail({ label, value, mono, color }: { label: string; value: string; mono?: boolean; color?: string }) { return <div><dt className="text-xs text-[#979799]">{label}</dt><dd className={`mt-1 break-all text-[#17191c] ${mono ? "font-mono text-xs" : ""}`} style={{ color }}>{value}</dd></div>; }
function DetailBlock({ title, children }: { title: string; children: React.ReactNode }) { return <section className="mt-6"><p className="text-xs text-[#979799]">{title}</p><div className="mt-2 max-h-56 overflow-y-auto rounded-2xl bg-white p-4 text-sm leading-6 text-[#17191c]">{children}</div></section>; }
