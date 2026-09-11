"use client";

import { useMemo, useState, useEffect } from "react";
import FullJourneyModal from "../components/FullJourneyModal";
import Link from "next/link";
import type { AgentFlowReport, LeadProfile } from "../lib/types";
import { AuditTimeline } from "../components/AuditTimeline";
import { GovernancePanel } from "../components/GovernancePanel";
import { StagePill } from "../components/StagePill";
import { Badge } from "../components/ui/badge";
import { useBank } from "../components/BankContext";

const endpoint = "/api/agent-flow";

function formatCurrency(value: number) {
  return `₹${value.toLocaleString("en-IN")}`;
}

export default function HomePage() {
  const { activeBank } = useBank();
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
      const response = await fetch(`${endpoint}?bank=${activeBank.id}`);
      const data: AgentFlowReport = await response.json();
      setReport(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (report) {
      runJourney();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeBank]);

  return (
    <main className="editorial-page">
      <div className="editorial-container py-8 md:py-12">
        <section className="relative overflow-hidden pb-14 pt-8 md:pb-24 md:pt-16">
          <div className="relative z-10 mx-auto max-w-4xl text-center">
            <p className="editorial-eyebrow mb-5">Governance-first {activeBank.name} agentic AI</p>
            <h1 className="editorial-title mx-auto max-w-4xl">
              Banking journeys, <em>made accountable.</em>
            </h1>
            <p className="editorial-subhead mx-auto mt-6">
              Acquisition, qualification, personalization and secure Video KYC—one regulated journey with every decision visible and ready for review.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <button type="button" onClick={() => setOpenJourney(true)} className="editorial-pill editorial-pill--filled">
                Run Full Journey
              </button>
              <Link href="/agent-flow" className="editorial-pill editorial-pill--ghost">
                View orchestration
              </Link>
            </div>
          </div>

          <div className="relative mx-auto mt-12 grid max-w-5xl gap-4 md:mt-16 md:grid-cols-3">
            <div className="editorial-artifact p-5 text-left md:translate-y-8">
              <p className="editorial-eyebrow">Decision confidence</p>
              <p className="mt-3 text-3xl font-medium tracking-[-0.04em]">96.4%</p>
              <div className="mt-5 flex h-10 items-end gap-1">
                {[32, 45, 37, 58, 51, 74, 67, 94].map((height, index) => (
                  <span key={index} className="flex-1 rounded-full bg-[#fbe1d1]" style={{ height: `${height}%` }} />
                ))}
              </div>
            </div>
            <div className="editorial-peach p-6 text-left md:-translate-y-4">
              <p className="text-sm">Live governance</p>
              <p className="mt-3 font-display text-3xl leading-tight tracking-[-0.03em]">Every recommendation carries its rationale.</p>
              <p className="mt-5 text-sm">Human review routes surfaced automatically →</p>
            </div>
            <div className="editorial-artifact p-5 text-left md:translate-y-8">
              <div className="flex items-center justify-between">
                <p className="editorial-eyebrow">Onboarding</p>
                <span className="h-2.5 w-2.5 rounded-full bg-[#17191c]" />
              </div>
              <p className="mt-3 text-3xl font-medium tracking-[-0.04em]">2m 18s</p>
              <p className="mt-2 text-sm text-[#777b86]">Average compliant KYC completion</p>
            </div>
          </div>
          <nav aria-label="Product areas" className="mt-14 flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm text-[#777b86]">
            <Link href="/governance" className="hover:text-[#17191c] hover:underline">Governance →</Link>
            <Link href="/lead-intelligence" className="hover:text-[#17191c] hover:underline">Lead intelligence →</Link>
            <Link href="/campaign-optimization" className="hover:text-[#17191c] hover:underline">Campaigns →</Link>
            <Link href="/offer-personalization" className="hover:text-[#17191c] hover:underline">Offers →</Link>
          </nav>
        </section>

        {report ? (
          <section className="mt-8 grid gap-6 lg:grid-cols-[1.5fr_0.95fr]">
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-3xl border border-brand-border bg-brand-panel/80 p-6">
                  <p className="text-sm uppercase tracking-[0.24em] text-brand.muted">
                    Selected Lead
                  </p>
                  <p className="mt-3 text-2xl font-semibold text-white">
                    {report.selectedLeadName}
                  </p>
                  <p className="mt-2 text-sm text-brand.muted">
                    {report.selectedLeadSegment}
                  </p>
                </div>
                <div className="rounded-3xl border border-brand-border bg-brand-panel/80 p-6">
                  <p className="text-sm uppercase tracking-[0.24em] text-brand.muted">
                    Primary Outcome
                  </p>
                  <p className="mt-3 text-2xl font-semibold text-white">
                    {leadProfile?.score.decisionGrade}
                  </p>
                  <p className="mt-2 text-sm text-brand.muted">
                    Confidence {leadProfile?.score.confidence}%
                  </p>
                </div>
                <div className="rounded-3xl border border-brand-border bg-brand-panel/80 p-6">
                  <p className="text-sm uppercase tracking-[0.24em] text-brand.muted">
                    Offer Package
                  </p>
                  <p className="mt-3 text-2xl font-semibold text-white">
                    {report.offer.recommendation}
                  </p>
                  <p className="mt-2 text-sm text-brand.muted">
                    {report.offer.governanceLabel}
                  </p>
                </div>
                <div className="rounded-3xl border border-brand-border bg-brand-panel/80 p-6">
                  <p className="text-sm uppercase tracking-[0.24em] text-brand.muted">
                    Video KYC Status
                  </p>
                  <p className="mt-3 text-2xl font-semibold text-white">
                    {report.onboarding.status}
                  </p>
                  <p className="mt-2 text-sm text-brand.muted">
                    {report.onboarding.exceptionFlags.length > 0
                      ? "Exception path active"
                      : "Standard routing"}
                  </p>
                </div>
              </div>

              <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                <div className="rounded-3xl border border-brand-border bg-brand-panel/80 p-6">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-sm uppercase tracking-[0.24em] text-brand.muted">
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
                <div className="rounded-3xl border border-brand-border bg-brand-panel/80 p-6">
                  <h3 className="text-lg font-semibold text-white">
                    Lead intelligence
                  </h3>
                  <p className="mt-2 text-sm text-brand.muted">
                    Segment-aware persona, language preference, and regulatory
                    notes for the selected customer.
                  </p>
                  <div className="mt-5 space-y-4">
                    <div className="rounded-2xl bg-brand-surface/80 p-4">
                      <p className="text-sm text-brand.muted">Persona</p>
                      <p className="mt-1 text-base font-semibold text-white">
                        {leadProfile?.persona.title}
                      </p>
                      <p className="text-sm text-brand.muted">
                        {leadProfile?.persona.archetype}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-brand-surface/80 p-4">
                      <p className="text-sm text-brand.muted">Regulatory notes</p>
                      <p className="mt-1 text-sm text-brand.muted">
                        {leadProfile?.regulatoryNotes}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-brand-surface/80 p-4">
                      <p className="text-sm text-brand.muted">Risk & value</p>
                      <p className="mt-1 text-base font-semibold text-white">
                        {formatCurrency(leadProfile?.score.businessValue ?? 0)}
                      </p>
                      <p className="text-sm text-brand.muted">
                        Compliance risk {leadProfile?.score.complianceRisk}%
                      </p>
                    </div>
                  </div>
                </div>
                <div className="rounded-3xl border border-brand-border bg-brand-panel/80 p-6">
                  <h3 className="text-lg font-semibold text-white">
                    Personalized outreach
                  </h3>
                  <p className="mt-2 text-sm text-brand.muted">
                    Language: {report.personalization.languageUsed}
                  </p>
                  <div className="mt-5 whitespace-pre-line rounded-3xl border border-brand-border bg-brand-surface/80 p-4 text-sm leading-7 text-brand.muted">
                    {report.personalization.message}
                  </div>
                </div>
              </div>
            </div>

            <aside className="space-y-6">
              <div className="rounded-3xl border border-brand-border bg-brand-panel/80 p-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.24em] text-brand.muted">
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
              <div className="rounded-3xl border border-brand-border bg-brand-panel/80 p-6">
                <h3 className="text-lg font-semibold text-white">
                  Video KYC control center
                </h3>
                <p className="mt-2 text-sm text-brand.muted">
                  Exception routing, spoof risk flags and human review path are
                  visible here.
                </p>
                <div className="mt-5 space-y-3 rounded-3xl bg-brand-surface/80 p-4 text-sm text-brand.muted">
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
          <section className="editorial-card mt-4 p-8 text-brand.muted md:p-10">
            <p className="editorial-eyebrow">Interactive demo</p>
            <h2 className="editorial-section-title mt-3 max-w-2xl">
              Ready for a live simulation.
            </h2>
            <p className="mt-5 max-w-2xl text-[17px] leading-7">
              Click Run Full Journey to see the {activeBank.name} agentic platform score a
              lead, recommend acquisition strategy, generate communications, and
              route the onboarding experience with governance controls.
            </p>
          </section>
        )}

        <footer className="mt-12 border-t border-brand-border pt-6 text-sm text-brand.muted">
          {activeBank.fullName} Agentic AI | Enterprise acquisition platform · Visible
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
