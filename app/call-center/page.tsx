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
const agentConfig: Record<AgentType, { label: string; color: string; emoji: string }> = {
  outreach: { label: "Lead Outreach", color: "#3b82f6", emoji: "📞" },
  "offer-explain": { label: "Offer Explanation", color: "#10b981", emoji: "🏦" },
  support: { label: "Customer Support", color: "#8b5cf6", emoji: "🎧" },
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
    if (!phone) return alert("Enter a phone number first (e.g. +91XXXXXXXXXX)");
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
        addCallRecord(activeAgent, DEMO_LEAD.name, phone, data);
      } else {
        alert("Call failed: " + (data?.error ?? "unknown error"));
      }
    } catch (e) {
      alert("Network error: " + String(e));
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
    <div style={{ minHeight: "100vh", background: "var(--brand-bg, #031026)", color: "#e3edff", fontFamily: "Inter, sans-serif" }}>
      {/* Header */}
      <header style={{ borderBottom: "1px solid var(--brand-border, #143b75)", padding: "1.25rem 2rem", display: "flex", alignItems: "center", gap: "1rem" }}>
        <span style={{ fontSize: "1.5rem" }}>📞</span>
        <div>
          <h1 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 700, color: "#7ec7ff" }}>CALL-E Call Center</h1>
          <p style={{ margin: 0, fontSize: ".8rem", color: "#9cb7d4" }}>AI Phone Agents — Lead Outreach · Offer Explanation · Customer Support</p>
        </div>
      </header>

      <div style={{ display: "flex", gap: "1.5rem", padding: "2rem", maxWidth: 1280, margin: "0 auto", flexWrap: "wrap" }}>

        {/* ── Left panel: Controls ── */}
        <div style={{ flex: "0 0 340px", background: "var(--brand-panel, #081c42)", borderRadius: 12, padding: "1.5rem", border: "1px solid var(--brand-border, #143b75)" }}>
          <h2 style={{ margin: "0 0 1.25rem", fontSize: "1rem", color: "#7ec7ff" }}>Trigger a Call</h2>

          {/* Agent selector */}
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", marginBottom: ".4rem", fontSize: ".8rem", color: "#9cb7d4" }}>Agent Type</label>
            <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap" }}>
              {(Object.keys(agentConfig) as AgentType[]).map((a) => (
                <button
                  key={a}
                  onClick={() => setActiveAgent(a)}
                  style={{
                    padding: ".4rem .9rem",
                    borderRadius: 9999,
                    border: `2px solid ${activeAgent === a ? agentConfig[a].color : "transparent"}`,
                    background: activeAgent === a ? agentConfig[a].color + "22" : "transparent",
                    color: activeAgent === a ? agentConfig[a].color : "#9cb7d4",
                    cursor: "pointer",
                    fontSize: ".8rem",
                    fontWeight: 600,
                  }}
                >
                  {agentConfig[a].emoji} {agentConfig[a].label}
                </button>
              ))}
            </div>
          </div>

          {/* Phone input */}
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", marginBottom: ".4rem", fontSize: ".8rem", color: "#9cb7d4" }}>Lead Phone Number</label>
            <input
              type="tel"
              placeholder="+91XXXXXXXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={{ width: "100%", padding: ".6rem .8rem", borderRadius: 8, border: "1px solid var(--brand-border, #143b75)", background: "var(--brand-surface, #06112d)", color: "#e3edff", fontSize: ".9rem", boxSizing: "border-box" }}
            />
          </div>

          {/* Bank selector */}
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ display: "block", marginBottom: ".4rem", fontSize: ".8rem", color: "#9cb7d4" }}>Bank ID (theme)</label>
            <select
              value={bankId}
              onChange={(e) => setBankId(e.target.value)}
              style={{ width: "100%", padding: ".6rem .8rem", borderRadius: 8, border: "1px solid var(--brand-border, #143b75)", background: "var(--brand-surface, #06112d)", color: "#e3edff", fontSize: ".9rem", boxSizing: "border-box" }}
            >
              <option value="default">Default</option>
              <option value="apex">Apex Bank</option>
              <option value="horizon">Horizon Bank</option>
              <option value="stellar">Stellar Bank</option>
            </select>
          </div>

          {/* Demo lead info */}
          <div style={{ background: "rgba(29,139,255,.08)", borderRadius: 8, padding: "1rem", marginBottom: "1.5rem", fontSize: ".8rem", color: "#9cb7d4" }}>
            <div style={{ fontWeight: 600, color: "#7ec7ff", marginBottom: ".5rem" }}>Demo Lead: {DEMO_LEAD.name}</div>
            <div>City: {DEMO_LEAD.city} · Age: {DEMO_LEAD.age}</div>
            <div>Segment: {DEMO_LEAD.segment}</div>
            <div>Conversion: {DEMO_LEAD.score.conversionProbability}%</div>
            <div style={{ marginTop: ".4rem", fontStyle: "italic" }}>{DEMO_LEAD.challengeSummary}</div>
          </div>

          <button
            onClick={triggerCall}
            disabled={loading}
            style={{
              width: "100%",
              padding: ".8rem",
              borderRadius: 10,
              border: "none",
              background: loading ? "#334155" : agentConfig[activeAgent].color,
              color: "#fff",
              fontWeight: 700,
              fontSize: "1rem",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "background .2s",
            }}
          >
            {loading ? "Initiating Call…" : `${agentConfig[activeAgent].emoji} Start ${agentConfig[activeAgent].label} Call`}
          </button>
        </div>

        {/* ── Middle panel: Call Log ── */}
        <div style={{ flex: "1 1 320px", minWidth: 0 }}>
          <h2 style={{ margin: "0 0 1rem", fontSize: "1rem", color: "#7ec7ff" }}>Call Log ({calls.length})</h2>
          {calls.length === 0 && (
            <div style={{ color: "#9cb7d4", fontSize: ".9rem", padding: "2rem", textAlign: "center", background: "var(--brand-panel, #081c42)", borderRadius: 12, border: "1px solid var(--brand-border, #143b75)" }}>
              No calls yet. Trigger one from the left panel.
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: ".75rem" }}>
            {calls.map((call) => (
              <div
                key={call.id}
                onClick={() => setSelectedCallId(call.id === selectedCallId ? null : call.id)}
                style={{
                  background: "var(--brand-panel, #081c42)",
                  borderRadius: 10,
                  padding: "1rem 1.25rem",
                  border: `1px solid ${selectedCallId === call.id ? agentConfig[call.agent].color : "var(--brand-border, #143b75)"}`,
                  cursor: "pointer",
                  transition: "border-color .15s",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: ".4rem" }}>
                  <span style={{ fontWeight: 600, color: agentConfig[call.agent].color, fontSize: ".9rem" }}>
                    {agentConfig[call.agent].emoji} {agentConfig[call.agent].label}
                  </span>
                  <span style={{ fontSize: ".75rem", padding: ".2rem .6rem", borderRadius: 9999, background: statusColor(call.status) + "22", color: statusColor(call.status), fontWeight: 600 }}>
                    {call.status}
                  </span>
                </div>
                <div style={{ fontSize: ".85rem", color: "#e3edff" }}>{call.leadName} · {call.toPhone}</div>
                <div style={{ fontSize: ".75rem", color: "#9cb7d4", marginTop: ".3rem" }}>
                  {call.timestamp}
                  {call.runId && <span style={{ marginLeft: ".5rem" }}>run: {call.runId.slice(0, 12)}…</span>}
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); refreshStatus(call); }}
                  style={{ marginTop: ".6rem", fontSize: ".75rem", padding: ".25rem .7rem", borderRadius: 9999, border: "1px solid var(--brand-border, #143b75)", background: "transparent", color: "#9cb7d4", cursor: "pointer" }}
                >
                  ↻ Refresh Status
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right panel: Detail ── */}
        {selected && (
          <div style={{ flex: "0 0 320px", background: "var(--brand-panel, #081c42)", borderRadius: 12, padding: "1.5rem", border: "1px solid var(--brand-border, #143b75)", fontSize: ".85rem" }}>
            <h2 style={{ margin: "0 0 1rem", fontSize: "1rem", color: "#7ec7ff" }}>Call Detail</h2>
            <div style={{ display: "grid", gap: ".5rem" }}>
              <Row label="Agent" value={`${agentConfig[selected.agent].emoji} ${agentConfig[selected.agent].label}`} />
              <Row label="Lead" value={selected.leadName} />
              <Row label="Phone" value={selected.toPhone} />
              <Row label="Status" value={selected.status} valueColor={statusColor(selected.status)} />
              {selected.planId && <Row label="Plan ID" value={selected.planId} mono />}
              {selected.runId && <Row label="Run ID" value={selected.runId} mono />}
              {selected.sentimentScore !== undefined && (
                <Row label="Sentiment" value={`${selected.sentimentScore}/100`} />
              )}
            </div>
            {selected.summary && (
              <div style={{ marginTop: "1rem" }}>
                <div style={{ color: "#9cb7d4", marginBottom: ".3rem", fontSize: ".8rem" }}>Summary</div>
                <div style={{ background: "var(--brand-surface, #06112d)", borderRadius: 8, padding: ".75rem", lineHeight: 1.6 }}>{selected.summary}</div>
              </div>
            )}
            {selected.transcript && (
              <div style={{ marginTop: "1rem" }}>
                <div style={{ color: "#9cb7d4", marginBottom: ".3rem", fontSize: ".8rem" }}>Transcript</div>
                <div style={{ background: "var(--brand-surface, #06112d)", borderRadius: 8, padding: ".75rem", maxHeight: 220, overflowY: "auto", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{selected.transcript}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value, mono, valueColor }: { label: string; value: string; mono?: boolean; valueColor?: string }) {
  return (
    <div style={{ display: "flex", gap: ".5rem" }}>
      <span style={{ color: "#9cb7d4", minWidth: 90 }}>{label}</span>
      <span style={{ color: valueColor ?? "#e3edff", fontFamily: mono ? "monospace" : undefined, fontSize: mono ? ".8rem" : undefined, wordBreak: "break-all" }}>{value}</span>
    </div>
  );
}
