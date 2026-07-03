"use client";

import { useMemo, useState } from "react";
import { Badge } from "../../components/ui/badge";
import { syntheticLeads } from "../../data/leads";
import { generateOfferPersonalization } from "../../lib/offerPersonalizationEngine";
import type { LeadProfile, OfferCandidate } from "../../lib/types";

function formatCurrency(value: number) {
  return `₹${value.toLocaleString("en-IN")}`;
}

function statusClass(status: string) {
  switch (status) {
    case "policy-compliant":
      return "bg-emerald-500/10 text-emerald-200 border-emerald-500/20";
    case "borderline":
      return "bg-amber-500/10 text-amber-200 border-amber-500/20";
    default:
      return "bg-rose-500/10 text-rose-200 border-rose-500/20";
  }
}

export default function OfferPersonalizationPage() {
  const [selectedLeadId, setSelectedLeadId] = useState(
    syntheticLeads[0]?.id ?? "",
  );
  const [manualOverrides, setManualOverrides] = useState<
    Record<string, "approved" | "rejected" | "none">
  >({});

  const selectedLead = useMemo<LeadProfile>(() => {
    return (
      syntheticLeads.find((lead) => lead.id === selectedLeadId) ||
      syntheticLeads[0]
    );
  }, [selectedLeadId]);

  const personalization = useMemo(
    () => generateOfferPersonalization(selectedLead),
    [selectedLeadId, selectedLead],
  );

  const eligibleCount = personalization.topOffers.length;
  const declinedCount = personalization.declinedOffers.length;

  const handleOverride = (offerId: string, action: "approved" | "rejected") => {
    setManualOverrides((prev) => ({
      ...prev,
      [offerId]: action,
    }));
  };

  const getOverrideLabel = (offer: OfferCandidate) =>
    manualOverrides[offer.id] ?? offer.manualOverride;

  return (
    <main className="min-h-screen bg-sbi-surface text-slate-100">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <section className="rounded-[2rem] border border-sbi-border bg-sbi-panel/90 p-8 shadow-panel backdrop-blur-xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-4">
              <Badge>Offer Personalization Studio</Badge>
              <h1 className="max-w-3xl text-4xl font-semibold leading-tight text-white">
                Governance-aware banking offers with explainable eligibility and
                policy controls.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-sbi.muted">
                Personalized recommendations, top-3 ranking, declined offer
                reasoning, and manual review actions for stakeholders.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-sbi-border bg-sbi-panel/80 p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-sbi.muted">
                  Sample customer profile
                </p>
                <h2 className="mt-3 text-2xl font-semibold text-white">
                  {selectedLead.name}
                </h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {syntheticLeads.map((lead) => (
                  <button
                    key={lead.id}
                    type="button"
                    onClick={() => setSelectedLeadId(lead.id)}
                    className={`rounded-full border px-4 py-2 text-sm transition ${
                      lead.id === selectedLeadId
                        ? "border-sbi.accent bg-sbi.accent text-slate-950"
                        : "border-sbi-border bg-sbi-surface text-slate-300 hover:border-slate-400"
                    }`}
                  >
                    {lead.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-3xl bg-sbi-surface/80 p-5">
                <p className="text-sm text-slate-400">Segment</p>
                <p className="mt-2 text-lg font-semibold text-white">
                  {selectedLead.segment}
                </p>
              </div>
              <div className="rounded-3xl bg-sbi-surface/80 p-5">
                <p className="text-sm text-slate-400">Income</p>
                <p className="mt-2 text-lg font-semibold text-white">
                  {formatCurrency(selectedLead.income)}
                </p>
              </div>
              <div className="rounded-3xl bg-sbi-surface/80 p-5">
                <p className="text-sm text-slate-400">Digital affinity</p>
                <p className="mt-2 text-lg font-semibold text-white">
                  {selectedLead.digitalAffinity}%
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-3xl bg-sbi-surface/80 p-5">
                <p className="text-sm text-slate-400">Recommended top offers</p>
                <p className="mt-3 text-3xl font-semibold text-white">
                  {eligibleCount}
                </p>
              </div>
              <div className="rounded-3xl bg-sbi-surface/80 p-5">
                <p className="text-sm text-slate-400">
                  Declined or deferred offers
                </p>
                <p className="mt-3 text-3xl font-semibold text-white">
                  {declinedCount}
                </p>
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-sbi-border bg-sbi-panel/80 p-6">
              <h3 className="text-lg font-semibold text-white">
                Policy summary
              </h3>
              <p className="mt-3 text-sm text-slate-400">
                {personalization.policySummary}
              </p>
              <div className="mt-5 rounded-3xl bg-sbi-surface/80 p-4 text-sm text-slate-300">
                {personalization.explainableNote}
              </div>
            </div>
            <div className="rounded-3xl border border-sbi-border bg-sbi-panel/80 p-6">
              <h3 className="text-lg font-semibold text-white">
                Review guidance
              </h3>
              <p className="mt-3 text-sm text-slate-400">
                {personalization.reviewerHint}
              </p>
            </div>
          </aside>
        </section>

        <section className="mt-8 space-y-6">
          <div className="rounded-3xl border border-sbi-border bg-sbi-panel/80 p-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-white">
                  Top 3 personalized bundles
                </h2>
                <p className="mt-2 text-sm text-slate-400">
                  Each recommendation is explainable using eligibility, product
                  fit, and policy guardrails.
                </p>
              </div>
              <Badge>Illustrative demo logic</Badge>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-3">
              {personalization.topOffers.map((offer) => (
                <div
                  key={offer.id}
                  className="rounded-3xl border border-sbi-border bg-sbi-surface/80 p-5"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm text-slate-400">{offer.bundle}</p>
                      <h3 className="mt-2 text-xl font-semibold text-white">
                        {offer.name}
                      </h3>
                    </div>
                    <span
                      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${statusClass(offer.policyStatus)}`}
                    >
                      {offer.policyStatus.replace("-", " ")}
                    </span>
                  </div>

                  <p className="mt-4 text-sm text-slate-300">
                    {offer.description}
                  </p>

                  <div className="mt-4 grid gap-2 text-sm text-slate-300">
                    <div className="flex items-center justify-between">
                      <span>Fit score</span>
                      <span className="font-semibold text-white">
                        {offer.fitScore}/100
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Benefits theme</span>
                      <span className="font-semibold text-white">
                        {offer.benefitsTheme}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Eligibility</span>
                      <span className="font-semibold text-white">
                        {offer.eligibility}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 rounded-3xl bg-slate-950/10 p-4 text-sm text-slate-300">
                    <p className="font-semibold text-white">Why this offer</p>
                    <p className="mt-2">{offer.whyThisOffer}</p>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleOverride(offer.id, "approved")}
                      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                        getOverrideLabel(offer) === "approved"
                          ? "bg-emerald-500 text-slate-950"
                          : "border border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800"
                      }`}
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOverride(offer.id, "rejected")}
                      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                        getOverrideLabel(offer) === "rejected"
                          ? "bg-rose-500 text-white"
                          : "border border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800"
                      }`}
                    >
                      Reject
                    </button>
                  </div>

                  <div className="mt-4 rounded-3xl bg-slate-950/10 p-4 text-xs uppercase tracking-[0.2em] text-slate-500">
                    Override status: {getOverrideLabel(offer)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-sbi-border bg-sbi-panel/80 p-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-white">
                  Why other offers were not shown
                </h2>
                <p className="mt-2 text-sm text-slate-400">
                  Declined bundles are explained with concrete eligibility and
                  policy reasons.
                </p>
              </div>
              <Badge>Reviewable logic</Badge>
            </div>

            <div className="mt-6 space-y-4">
              {personalization.declinedOffers.map((offer) => (
                <div
                  key={offer.id}
                  className="rounded-3xl border border-sbi-border bg-sbi-surface/70 p-5"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm text-slate-400">{offer.bundle}</p>
                      <h3 className="mt-2 text-lg font-semibold text-white">
                        {offer.name}
                      </h3>
                    </div>
                    <span
                      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${statusClass(offer.policyStatus)}`}
                    >
                      {offer.policyStatus.replace("-", " ")}
                    </span>
                  </div>

                  <div className="mt-4 text-sm text-slate-300">
                    {offer.whyNotShown.map((reason, index) => (
                      <p key={index} className="mt-2">
                        • {reason}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
