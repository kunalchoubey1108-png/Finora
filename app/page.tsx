"use client";

import { useMemo, useState } from "react";
import FullJourneyModal from "../components/FullJourneyModal";
import Link from "next/link";
import type { AgentFlowReport, LeadProfile } from "../lib/types";
import { AuditTimeline } from "../components/AuditTimeline";
import { GovernancePanel } from "../components/GovernancePanel";
import { StagePill } from "../components/StagePill";
import { Badge } from "../components/ui/badge";

const endpoint = "/api/agent-flow";

function formatCurrency(value: number) {
  return `₹${value.toLocaleString("en-IN")}`;
}

export default function HomePage() {
  const [report, setReport] = useState<AgentFlowReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [openJourney, setOpenJourney] = useState(false);

  const leadProfile = useMemo<LeadProfile | null>(() => {
    if (!report) return null;
    return (
      report.leads.find((lead: LeadProfile) => lead.isPrimary) ??
      report.leads[0]
    );
  }, [report]);

  async function runJourney() {
    setLoading(true);
    try {
      const response = await fetch(endpoint);
      const data: AgentFlowReport = await response.json();
      setReport(data);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-sbi-surface text-slate-100">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <section className="rounded-[2rem] border border-sbi-border bg-sbi-panel/90 p-8 shadow-panel backdrop-blur-xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-4">
              <Badge>Governance-first SBI Agentic AI</Badge>
              <h1 className="max-w-3xl text-4xl font-semibold leading-tight text-white">
                Acquisition, qualification, personalization and secure Video KYC
                onboarding in one regulated journey.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-sbi.muted">
                A banking-grade demo that makes the orchestrator visible,
                records every decision, and routes risk to human review.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => setOpenJourney(true)}
                className="inline-flex items-center justify-center rounded-full bg-sbi.accent px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sbi.highlight"
              >
                Run Full Journey
              </button>
              <Link
                href="/agent-flow"
                className="inline-flex items-center justify-center rounded-full border border-sbi-border bg-sbi-surface px-6 py-3 text-sm font-semibold text-sbi.highlight hover:border-sbi.accent transition"
              >
                View agent orchestration
              </Link>
              <Link
                href="/governance"
                className="inline-flex items-center justify-center rounded-full border border-sbi-border bg-sbi-surface px-6 py-3 text-sm font-semibold text-sbi.highlight hover:border-sbi.accent transition"
              >
                Governance dashboard
              </Link>
              <Link
                href="/lead-intelligence"
                className="inline-flex items-center justify-center rounded-full border border-sbi-border bg-sbi-surface px-6 py-3 text-sm font-semibold text-sbi.highlight hover:border-sbi.accent transition"
              >
                Lead intelligence
              </Link>
              <Link
                href="/campaign-optimization"
                className="inline-flex items-center justify-center rounded-full border border-sbi-border bg-sbi-surface px-6 py-3 text-sm font-semibold text-sbi.highlight hover:border-sbi.accent transition"
              >
                Campaign optimization
              </Link>
              <Link
                href="/offer-personalization"
                className="inline-flex items-center justify-center rounded-full border border-sbi-border bg-sbi-surface px-6 py-3 text-sm font-semibold text-sbi.highlight hover:border-sbi.accent transition"
              >
                Offer personalization
              </Link>
            </div>
          </div>
        </section>

        {report ? (
          <section className="mt-8 grid gap-6 lg:grid-cols-[1.5fr_0.95fr]">
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-3xl border border-sbi-border bg-sbi-panel/80 p-6">
                  <p className="text-sm uppercase tracking-[0.24em] text-sbi.muted">
                    Selected Lead
                  </p>
                  <p className="mt-3 text-2xl font-semibold text-white">
                    {report.selectedLeadName}
                  </p>
                  <p className="mt-2 text-sm text-sbi.muted">
                    {report.selectedLeadSegment}
                  </p>
                </div>
                <div className="rounded-3xl border border-sbi-border bg-sbi-panel/80 p-6">
                  <p className="text-sm uppercase tracking-[0.24em] text-sbi.muted">
                    Primary Outcome
                  </p>
                  <p className="mt-3 text-2xl font-semibold text-white">
                    {leadProfile?.score.decisionGrade}
                  </p>
                  <p className="mt-2 text-sm text-sbi.muted">
                    Confidence {leadProfile?.score.confidence}%
                  </p>
                </div>
                <div className="rounded-3xl border border-sbi-border bg-sbi-panel/80 p-6">
                  <p className="text-sm uppercase tracking-[0.24em] text-sbi.muted">
                    Offer Package
                  </p>
                  <p className="mt-3 text-2xl font-semibold text-white">
                    {report.offer.recommendation}
                  </p>
                  <p className="mt-2 text-sm text-sbi.muted">
                    {report.offer.governanceLabel}
                  </p>
                </div>
                <div className="rounded-3xl border border-sbi-border bg-sbi-panel/80 p-6">
                  <p className="text-sm uppercase tracking-[0.24em] text-sbi.muted">
                    Video KYC Status
                  </p>
                  <p className="mt-3 text-2xl font-semibold text-white">
                    {report.onboarding.status}
                  </p>
                  <p className="mt-2 text-sm text-sbi.muted">
                    {report.onboarding.exceptionFlags.length > 0
                      ? "Exception path active"
                      : "Standard routing"}
                  </p>
                </div>
              </div>

              <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                <div className="rounded-3xl border border-sbi-border bg-sbi-panel/80 p-6">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-sm uppercase tracking-[0.24em] text-sbi.muted">
                        Orchestrator pipeline
                      </p>
                      <h2 className="mt-3 text-2xl font-semibold text-white">
                        Explicit agent workflow
                      </h2>
                    </div>
                    <Badge
                      variant={
                        report.journeyState.humanActionRequired
                          ? "warning"
                          : "success"
                      }
                    >
                      {report.journeyState.humanActionRequired
                        ? "Human review required"
                        : "Auto path"}
                    </Badge>
                  </div>
                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    {report.stageStatuses.map(
                      (stage: (typeof report.stageStatuses)[0]) => (
                        <StagePill key={stage.stage} stage={stage} />
                      ),
                    )}
                  </div>
                </div>
                <GovernancePanel summary={report.governance} />
              </div>

              <div className="grid gap-6 lg:grid-cols-[0.95fr_0.8fr]">
                <div className="rounded-3xl border border-sbi-border bg-sbi-panel/80 p-6">
                  <h3 className="text-lg font-semibold text-white">
                    Lead intelligence
                  </h3>
                  <p className="mt-2 text-sm text-sbi.muted">
                    Segment-aware persona, language preference, and regulatory
                    notes for the selected customer.
                  </p>
                  <div className="mt-5 space-y-4">
                    <div className="rounded-2xl bg-sbi-surface/80 p-4">
                      <p className="text-sm text-sbi.muted">Persona</p>
                      <p className="mt-1 text-base font-semibold text-white">
                        {leadProfile?.persona.title}
                      </p>
                      <p className="text-sm text-sbi.muted">
                        {leadProfile?.persona.archetype}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-sbi-surface/80 p-4">
                      <p className="text-sm text-sbi.muted">Regulatory notes</p>
                      <p className="mt-1 text-sm text-sbi.muted">
                        {leadProfile?.regulatoryNotes}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-sbi-surface/80 p-4">
                      <p className="text-sm text-sbi.muted">Risk & value</p>
                      <p className="mt-1 text-base font-semibold text-white">
                        {formatCurrency(leadProfile?.score.businessValue ?? 0)}
                      </p>
                      <p className="text-sm text-sbi.muted">
                        Compliance risk {leadProfile?.score.complianceRisk}%
                      </p>
                    </div>
                  </div>
                </div>
                <div className="rounded-3xl border border-sbi-border bg-sbi-panel/80 p-6">
                  <h3 className="text-lg font-semibold text-white">
                    Personalized outreach
                  </h3>
                  <p className="mt-2 text-sm text-sbi.muted">
                    Language: {report.personalization.languageUsed}
                  </p>
                  <div className="mt-5 whitespace-pre-line rounded-3xl border border-sbi-border bg-sbi-surface/80 p-4 text-sm leading-7 text-sbi.muted">
                    {report.personalization.message}
                  </div>
                </div>
              </div>
            </div>

            <aside className="space-y-6">
              <div className="rounded-3xl border border-sbi-border bg-sbi-panel/80 p-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.24em] text-sbi.muted">
                      Audit log
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold text-white">
                      Decision traceability
                    </h2>
                  </div>
                </div>
                <div className="mt-6">
                  <AuditTimeline audit={report.auditLog} />
                </div>
              </div>
              <div className="rounded-3xl border border-sbi-border bg-sbi-panel/80 p-6">
                <h3 className="text-lg font-semibold text-white">
                  Video KYC control center
                </h3>
                <p className="mt-2 text-sm text-sbi.muted">
                  Exception routing, spoof risk flags and human review path are
                  visible here.
                </p>
                <div className="mt-5 space-y-3 rounded-3xl bg-sbi-surface/80 p-4 text-sm text-sbi.muted">
                  <p>
                    <strong>Status:</strong> {report.onboarding.status}
                  </p>
                  <p>
                    <strong>Review path:</strong>{" "}
                    {report.onboarding.manualReviewPath}
                  </p>
                  {report.onboarding.exceptionFlags.length > 0 ? (
                    <ul className="list-disc space-y-2 pl-5">
                      {report.onboarding.exceptionFlags.map((flag: string) => (
                        <li key={flag}>{flag}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>No exceptions detected in the KYC process.</p>
                  )}
                </div>
              </div>
            </aside>
          </section>
        ) : (
          <section className="mt-8 rounded-3xl border border-sbi-border bg-sbi-panel/80 p-8 text-sbi.muted">
            <h2 className="text-2xl font-semibold text-white">
              Ready for a live simulation
            </h2>
            <p className="mt-3 text-sm leading-7">
              Click Run Full Journey to see the SBI agentic platform score a
              lead, recommend acquisition strategy, generate communications, and
              route the onboarding experience with governance controls.
            </p>
          </section>
        )}

        <footer className="mt-12 border-t border-sbi-border pt-6 text-sm text-sbi.muted">
          SBI Agentic AI | Hackathon-grade acquisition platform · Visible
          governance · Secure onboarding.
        </footer>
      </div>
      <FullJourneyModal
        open={openJourney}
        onClose={() => setOpenJourney(false)}
      />
    </main>
  );
}
