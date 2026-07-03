"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Badge } from "../../components/ui/badge";
import { generateCampaignSimulation } from "../../lib/campaignOptimizationEngine";
import type { CampaignPerformance } from "../../lib/types";

const optimizationModes = [
  {
    key: "lowCAC" as const,
    label: "Optimize for low CAC",
    description: "Prioritize cost-efficient campaigns with volume potential.",
  },
  {
    key: "highQuality" as const,
    label: "Optimize for high-quality activated customers",
    description:
      "Prioritize campaigns with strong KYC completion and activation outcomes.",
  },
];

const metricClass: Record<string, string> = {
  totalSpend: "from-sky-500 via-cyan-500 to-blue-500",
  averageCAC: "from-purple-500 via-fuchsia-500 to-pink-500",
  averageConversion: "from-emerald-500 via-lime-500 to-yellow-400",
  averageKYC: "from-amber-500 via-orange-500 to-rose-500",
};

function sparkline(values: number[]) {
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  return values.map((value, index) => {
    const height = min === max ? 40 : 20 + ((value - min) / (max - min)) * 60;
    return (
      <div
        key={index}
        className="w-2 rounded-full bg-gradient-to-t from-sbi.accent to-sky-300"
        style={{ height: `${height}px` }}
      />
    );
  });
}

function formatCurrency(value: number) {
  return `₹${value.toLocaleString("en-IN")}`;
}

function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

export default function CampaignOptimizationPage() {
  const [optimizeFor, setOptimizeFor] = useState<"lowCAC" | "highQuality">(
    "lowCAC",
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const simulation = useMemo(
    () => generateCampaignSimulation(optimizeFor),
    [optimizeFor],
  );

  const topCampaigns = useMemo(() => {
    return [...simulation.campaigns]
      .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
      .slice(0, 3);
  }, [simulation.campaigns]);

  const selectedCampaign = useMemo<CampaignPerformance>(() => {
    return (
      simulation.campaigns.find((campaign) => campaign.id === selectedId) ||
      simulation.campaigns[0]
    );
  }, [selectedId, simulation.campaigns]);

  const actionCounts = useMemo(() => {
    return simulation.campaigns.reduce<Record<string, number>>(
      (acc, campaign) => {
        const action = campaign.recommendation ?? "test new creative";
        acc[action] = (acc[action] ?? 0) + 1;
        return acc;
      },
      {},
    );
  }, [simulation.campaigns]);

  const bestLowCost = useMemo<CampaignPerformance>(() => {
    return simulation.campaigns.reduce<CampaignPerformance>(
      (best, current) => (current.cac < best.cac ? current : best),
      simulation.campaigns[0],
    );
  }, [simulation.campaigns]);

  const bestHighQuality = useMemo<CampaignPerformance>(() => {
    return simulation.campaigns.reduce<CampaignPerformance>(
      (best, current) =>
        current.strategicQuality > best.strategicQuality ? current : best,
      simulation.campaigns[0],
    );
  }, [simulation.campaigns]);

  return (
    <main className="min-h-screen bg-sbi-surface text-slate-100">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <section className="rounded-[2rem] border border-sbi-border bg-sbi-panel/90 p-8 shadow-panel backdrop-blur-xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-4">
              <Badge>Campaign Optimization Console</Badge>
              <h1 className="max-w-3xl text-4xl font-semibold leading-tight text-white">
                Business-outcome-first ad optimization for banking campaigns.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-sbi.muted">
                Seeded synthetic campaign performance with premium analytical
                insights, audience/creative matrix analysis, and budget
                reallocation modelling.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-full border border-sbi-border bg-sbi-surface px-6 py-3 text-sm font-semibold text-sbi.highlight hover:border-sbi.accent transition"
              >
                Back to home
              </Link>
              <button
                type="button"
                onClick={() => setOptimizeFor("lowCAC")}
                className={`inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition ${
                  optimizeFor === "lowCAC"
                    ? "bg-sbi.accent text-slate-950"
                    : "border border-sbi-border bg-sbi-surface text-sbi.highlight hover:border-sbi.accent"
                }`}
              >
                Low CAC
              </button>
              <button
                type="button"
                onClick={() => setOptimizeFor("highQuality")}
                className={`inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition ${
                  optimizeFor === "highQuality"
                    ? "bg-sbi.accent text-slate-950"
                    : "border border-sbi-border bg-sbi-surface text-sbi.highlight hover:border-sbi.accent"
                }`}
              >
                High-quality activation
              </button>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-4">
          <article className="rounded-3xl border border-sbi-border bg-sbi-panel/80 p-6">
            <p className="text-sm uppercase tracking-[0.24em] text-sbi.muted">
              Simulation focus
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-white">
              {
                optimizationModes.find((mode) => mode.key === optimizeFor)
                  ?.label
              }
            </h2>
            <p className="mt-3 text-sm text-sbi.muted">
              {
                optimizationModes.find((mode) => mode.key === optimizeFor)
                  ?.description
              }
            </p>
          </article>
          <article className="rounded-3xl border border-sbi-border bg-sbi-panel/80 p-6">
            <p className="text-sm uppercase tracking-[0.24em] text-sbi.muted">
              Total portfolio spend
            </p>
            <p className="mt-4 text-3xl font-semibold text-white">
              {formatCurrency(simulation.totalSpend)}
            </p>
            <p className="mt-2 text-sm text-sbi.muted">
              Current allocation across {simulation.campaigns.length} campaigns.
            </p>
          </article>
          <article className="rounded-3xl border border-sbi-border bg-sbi-panel/80 p-6">
            <p className="text-sm uppercase tracking-[0.24em] text-sbi.muted">
              Average outcome metrics
            </p>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-300">Avg. CAC</span>
                <span className="font-semibold text-white">
                  {formatCurrency(simulation.averageCAC)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-300">Avg. conversion</span>
                <span className="font-semibold text-white">
                  {formatPercent(simulation.averageConversion)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-300">Avg. KYC completion</span>
                <span className="font-semibold text-white">
                  {simulation.averageKYC}%
                </span>
              </div>
            </div>
          </article>
          <article className="rounded-3xl border border-sbi-border bg-sbi-panel/80 p-6">
            <p className="text-sm uppercase tracking-[0.24em] text-sbi.muted">
              Recommendation mix
            </p>
            <div className="mt-4 grid gap-3">
              {Object.entries(actionCounts).map(([action, count]) => (
                <div
                  key={action}
                  className="rounded-2xl border border-sbi-border bg-sbi-surface/70 p-4"
                >
                  <p className="text-sm text-slate-400 capitalize">{action}</p>
                  <p className="mt-2 text-2xl font-semibold text-white">
                    {count}
                  </p>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="mt-8 grid gap-6 xl:grid-cols-[1.4fr_0.85fr]">
          <div className="space-y-6">
            <div className="rounded-3xl border border-sbi-border bg-sbi-panel/80 p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-sbi.muted">
                    Recommendation spotlight
                  </p>
                  <h2 className="mt-3 text-2xl font-semibold text-white">
                    Campaign actions backed by outcome evidence
                  </h2>
                </div>
                <p className="max-w-xl text-sm text-sbi.muted">
                  Each recommendation is driven by CAC, conversion, KYC,
                  activation and segment quality rather than clicks alone.
                </p>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {topCampaigns.map((campaign) => (
                  <div
                    key={campaign.id}
                    className="rounded-3xl border border-sbi-border bg-sbi-surface/70 p-5"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm text-slate-400">
                          {campaign.name}
                        </p>
                        <p className="text-xs uppercase tracking-[0.24em] text-sbi.muted">
                          {campaign.audience}
                        </p>
                      </div>
                      <Badge
                        variant={
                          campaign.recommendation === "scale"
                            ? "success"
                            : campaign.recommendation === "pause"
                              ? "danger"
                              : "warning"
                        }
                      >
                        {campaign.recommendationRationale}
                      </Badge>
                    </div>
                    <div className="mt-5 space-y-3 text-sm text-slate-300">
                      <p>
                        Score:{" "}
                        <span className="font-semibold text-white">
                          {campaign.score}
                        </span>
                      </p>
                      <p>CAC ₹{campaign.cac}</p>
                      <p>KYC {campaign.kycCompletion}%</p>
                      <p>Activation {campaign.activationRate}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-sbi-border bg-sbi-panel/80 p-6">
              <h2 className="text-2xl font-semibold text-white">
                Audience + creative matrix
              </h2>
              <p className="mt-2 text-sm text-sbi.muted">
                Compare how creative themes score across the most important
                banking audiences.
              </p>
              <div className="mt-6 overflow-x-auto">
                <div className="min-w-[720px]">
                  <div className="grid grid-cols-[1.8fr_repeat(3,minmax(0,1fr))] gap-2 text-sm font-semibold text-slate-400 uppercase tracking-[0.2em]">
                    <div className="p-3"></div>
                    <div className="p-3">Reward / trust</div>
                    <div className="p-3">Compliance</div>
                    <div className="p-3">Premium fit</div>
                  </div>
                  {Array.from(
                    new Set(
                      simulation.audienceCreativeMatrix.map(
                        (row) => row.audience,
                      ),
                    ),
                  ).map((audience) => (
                    <div
                      key={audience}
                      className="grid grid-cols-[1.8fr_repeat(3,minmax(0,1fr))] gap-2 mt-2"
                    >
                      <div className="rounded-3xl bg-sbi-surface/60 p-3 text-sm font-semibold text-white">
                        {audience}
                      </div>
                      {simulation.audienceCreativeMatrix
                        .filter((row) => row.audience === audience)
                        .map((row) => (
                          <div
                            key={row.creative}
                            className="rounded-3xl bg-sbi-panel/70 p-3 text-sm text-slate-300"
                          >
                            <div className="font-semibold text-white">
                              {row.effectiveness}%
                            </div>
                            <p className="mt-2 text-xs text-slate-400">
                              {row.qualitySignal}
                            </p>
                          </div>
                        ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-sbi-border bg-sbi-panel/80 p-6">
              <h2 className="text-2xl font-semibold text-white">
                Why cheapest leads are not always best leads
              </h2>
              <div className="mt-4 space-y-3 text-sm text-slate-300">
                <p>
                  {bestLowCost.name} delivers the lowest CAC, but its KYC
                  completion of {bestLowCost.kycCompletion}% and activation rate
                  of {bestLowCost.activationRate}% mean the business outcome is
                  fragile.
                </p>
                <p>
                  By contrast, {bestHighQuality.name} has stronger segment
                  quality ({bestHighQuality.strategicQuality}%) and activation,
                  making it a better candidate when the goal is high-quality
                  activated customers.
                </p>
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-sbi-border bg-sbi-panel/80 p-6">
              <h2 className="text-2xl font-semibold text-white">
                Selected campaign trends
              </h2>
              <p className="mt-2 text-sm text-sbi.muted">
                Review the selected campaign's CAC, conversion, and KYC
                performance over four weeks.
              </p>
              <div className="mt-6 space-y-6">
                <div className="rounded-3xl bg-sbi-surface/70 p-4">
                  <div className="flex items-center justify-between text-slate-400 text-sm mb-4">
                    <span>CAC trend</span>
                    <span>
                      {formatCurrency(
                        selectedCampaign.timeline.slice(-1)[0].cac,
                      )}
                    </span>
                  </div>
                  <div className="flex items-end gap-1 h-24">
                    {sparkline(
                      selectedCampaign.timeline.map((item) => item.cac),
                    )}
                  </div>
                </div>
                <div className="rounded-3xl bg-sbi-surface/70 p-4">
                  <div className="flex items-center justify-between text-slate-400 text-sm mb-4">
                    <span>Conversion trend</span>
                    <span>
                      {formatPercent(
                        selectedCampaign.timeline.slice(-1)[0].conversionRate,
                      )}
                    </span>
                  </div>
                  <div className="flex items-end gap-1 h-24">
                    {sparkline(
                      selectedCampaign.timeline.map(
                        (item) => item.conversionRate * 100,
                      ),
                    )}
                  </div>
                </div>
                <div className="rounded-3xl bg-sbi-surface/70 p-4">
                  <div className="flex items-center justify-between text-slate-400 text-sm mb-4">
                    <span>KYC completion</span>
                    <span>
                      {selectedCampaign.timeline.slice(-1)[0].kycCompletion}%
                    </span>
                  </div>
                  <div className="flex items-end gap-1 h-24">
                    {sparkline(
                      selectedCampaign.timeline.map(
                        (item) => item.kycCompletion,
                      ),
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-sbi-border bg-sbi-panel/80 p-6">
              <h2 className="text-2xl font-semibold text-white">
                Spend reallocation summary
              </h2>
              <p className="mt-2 text-sm text-sbi.muted">
                Before and after budget allocation shows where optimization
                shifts investment.
              </p>
              <div className="mt-6 space-y-4">
                {simulation.budgetAfter.map((budget, index) => (
                  <div
                    key={index}
                    className="rounded-3xl bg-sbi-surface/70 p-4"
                  >
                    <div className="flex items-center justify-between gap-3 text-sm text-slate-400">
                      <span>{budget.channel}</span>
                      <span>{budget.share}%</span>
                    </div>
                    <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-800">
                      <div
                        className="h-full bg-gradient-to-r from-sbi.accent to-sky-400"
                        style={{ width: `${budget.share}%` }}
                      />
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                      <span>After: {formatCurrency(budget.amount)}</span>
                      <span>
                        Before:{" "}
                        {formatCurrency(
                          simulation.budgetBefore[index]?.amount ??
                            budget.amount,
                        )}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </section>

        <footer className="mt-12 border-t border-sbi-border pt-6 text-sm text-sbi.muted">
          Campaign optimization that balances cost, compliance, and activation
          outcomes.
        </footer>
      </div>
    </main>
  );
}
