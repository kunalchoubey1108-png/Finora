"use client";

import { useMemo } from "react";
import type { GovernanceDashboardMetrics } from "../../lib/auditLog";
import { calculateGovernanceMetrics } from "../../lib/auditLog";
import { Badge } from "../../components/ui/badge";

function getMetricTrend(
  current: number,
  previous: number,
): "up" | "down" | "stable" {
  if (current > previous) return "up";
  if (current < previous) return "down";
  return "stable";
}

export default function GovernanceDashboardPage() {
  // Mock data - in production, fetch from API
  const mockMetrics: GovernanceDashboardMetrics = useMemo(() => {
    const mockResults = Array.from({ length: 45 }, (_, i) => ({
      timestamp: new Date(Date.now() - i * 60000).toISOString(),
      passesBasicThreshold: Math.random() > 0.15,
      needsManualReview: Math.random() > 0.7,
      requiresEscalation: Math.random() > 0.92,
      fairnessWarnings:
        Math.random() > 0.8 ? ["Age flag", "Income mismatch"] : [],
      consentGaps: Math.random() > 0.85 ? ["Marketing consent"] : [],
      policyViolations: Math.random() > 0.9 ? ["High compliance risk"] : [],
      recommendedReviewer: "Governance Analyst",
      riskSeverity: (["Low", "Moderate", "Elevated", "Critical"] as const)[
        Math.floor(Math.random() * 4)
      ],
    }));
    return calculateGovernanceMetrics(mockResults);
  }, []);

  return (
    <main className="min-h-screen bg-sbi-surface text-slate-100">
      <div className="mx-auto max-w-7xl px-6 py-10">
        {/* Header */}
        <section className="mb-8">
          <h1 className="text-4xl font-semibold text-white">
            Governance & Compliance Dashboard
          </h1>
          <p className="mt-2 text-lg text-sbi.muted">
            Real-time oversight of acquisition decisions, policy compliance, and
            fairness metrics
          </p>
        </section>

        {/* Executive Summary Grid */}
        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-8">
          <div className="rounded-2xl border border-sbi-border bg-sbi-panel/80 p-6">
            <p className="text-xs uppercase tracking-wide text-sbi.muted">
              Today's Decisions
            </p>
            <p className="mt-3 text-3xl font-bold text-white">
              {mockMetrics.totalDecisions}
            </p>
            <p className="mt-2 text-xs text-slate-400">
              {mockMetrics.autoApprovedCount} auto-approved
            </p>
          </div>

          <div className="rounded-2xl border border-sbi-border bg-sbi-panel/80 p-6">
            <p className="text-xs uppercase tracking-wide text-sbi.muted">
              Manual Review Queue
            </p>
            <p className="mt-3 text-3xl font-bold text-sbi.highlight">
              {mockMetrics.manualReviewCount}
            </p>
            <p className="mt-2 text-xs text-slate-400">
              Average confidence 87%
            </p>
          </div>

          <div className="rounded-2xl border border-sbi-border bg-sbi-panel/80 p-6">
            <p className="text-xs uppercase tracking-wide text-sbi.muted">
              Escalated Cases
            </p>
            <p className="mt-3 text-3xl font-bold text-amber-400">
              {mockMetrics.escalatedCount}
            </p>
            <p className="mt-2 text-xs text-slate-400">Requires review today</p>
          </div>

          <div className="rounded-2xl border border-sbi-border bg-sbi-panel/80 p-6">
            <p className="text-xs uppercase tracking-wide text-sbi.muted">
              Overrides
            </p>
            <p className="mt-3 text-3xl font-bold text-slate-100">
              {mockMetrics.overriddenCount}
            </p>
            <p className="mt-2 text-xs text-slate-400">
              {Math.round(
                (mockMetrics.overriddenCount / mockMetrics.totalDecisions) *
                  100,
              )}
              % of total
            </p>
          </div>

          <div className="rounded-2xl border border-sbi-border bg-sbi-panel/80 p-6">
            <p className="text-xs uppercase tracking-wide text-sbi.muted">
              Avg Confidence
            </p>
            <p className="mt-3 text-3xl font-bold text-green-400">
              {Math.round(mockMetrics.averageConfidence)}%
            </p>
            <p className="mt-2 text-xs text-slate-400">
              Decision quality score
            </p>
          </div>
        </section>

        <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
          {/* Risk Distribution */}
          <section className="rounded-2xl border border-sbi-border bg-sbi-panel/80 p-6">
            <h2 className="text-lg font-semibold text-white">
              Risk Distribution
            </h2>
            <div className="mt-6 space-y-4">
              {Object.entries(mockMetrics.riskDistribution).map(
                ([tier, count]) => {
                  const colors = {
                    Low: "bg-green-500/20 text-green-400",
                    Moderate: "bg-blue-500/20 text-blue-400",
                    Elevated: "bg-amber-500/20 text-amber-400",
                    Critical: "bg-red-500/20 text-red-400",
                  };
                  return (
                    <div key={tier}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-300">
                          {tier} Risk
                        </span>
                        <span
                          className={`text-sm font-semibold ${colors[tier as keyof typeof colors]}`}
                        >
                          {count} cases
                        </span>
                      </div>
                      <div className="rounded-full bg-sbi-surface h-2 overflow-hidden">
                        <div
                          className={`h-2 ${
                            tier === "Low"
                              ? "bg-green-500"
                              : tier === "Moderate"
                                ? "bg-blue-500"
                                : tier === "Elevated"
                                  ? "bg-amber-500"
                                  : "bg-red-500"
                          }`}
                          style={{
                            width: `${Math.max(10, (count / mockMetrics.totalDecisions) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                },
              )}
            </div>
          </section>

          {/* Override Queue by Reviewer */}
          <section className="rounded-2xl border border-sbi-border bg-sbi-panel/80 p-6">
            <h2 className="text-lg font-semibold text-white">
              Reviewer Workload
            </h2>
            <div className="mt-6 space-y-4">
              {Object.entries(mockMetrics.overrideQueueByReviewer).map(
                ([reviewer, count]) => (
                  <div
                    key={reviewer}
                    className="rounded-xl bg-sbi-surface/50 border border-sbi-border/30 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-white text-sm">
                          {reviewer}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          Pending review
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-sbi.highlight">
                          {count}
                        </p>
                        <Badge variant="default">In Queue</Badge>
                      </div>
                    </div>
                  </div>
                ),
              )}
            </div>
          </section>
        </div>

        {/* Top Fairness Flags */}
        <section className="mt-8 rounded-2xl border border-sbi-border bg-sbi-panel/80 p-6">
          <h2 className="text-lg font-semibold text-white">
            Top Fairness Alerts
          </h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {mockMetrics.topFairnessFlags.map((flag) => (
              <div
                key={flag.flag}
                className="rounded-xl bg-sbi-surface/50 border border-amber-500/20 p-4"
              >
                <p className="text-sm font-semibold text-white">{flag.flag}</p>
                <p className="mt-2 text-2xl font-bold text-amber-400">
                  {flag.count}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  cases flagged this week
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Policy Violations Trend */}
        <section className="mt-8 rounded-2xl border border-sbi-border bg-sbi-panel/80 p-6">
          <h2 className="text-lg font-semibold text-white">
            Weekly Policy Violations
          </h2>
          <div className="mt-6 flex items-end justify-between gap-2 h-40">
            {mockMetrics.policyViolationsTrend.map((day) => (
              <div
                key={day.day}
                className="flex-1 flex flex-col items-center gap-2"
              >
                <div className="w-full flex flex-col items-center">
                  <div
                    className="w-full rounded-t bg-gradient-to-t from-sbi.accent to-sbi.highlight transition-all"
                    style={{
                      height: `${Math.max(10, (day.count / 20) * 100)}%`,
                    }}
                  />
                </div>
                <p className="text-xs font-semibold text-slate-300">
                  {day.day}
                </p>
                <p className="text-xs text-slate-500">{day.count}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Compliance Status */}
        <section className="mt-8 rounded-2xl border border-sbi-border bg-sbi-panel/80 p-6">
          <h2 className="text-lg font-semibold text-white">
            Compliance Status
          </h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-xl bg-green-500/10 border border-green-500/30 p-4">
              <p className="text-sm text-green-300 uppercase tracking-wide">
                ✓ Compliant
              </p>
              <p className="mt-3 text-3xl font-bold text-green-400">94%</p>
              <p className="mt-1 text-xs text-green-300">
                of decisions pass policy checks
              </p>
            </div>
            <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 p-4">
              <p className="text-sm text-amber-300 uppercase tracking-wide">
                ⚠ Warning
              </p>
              <p className="mt-3 text-3xl font-bold text-amber-400">5%</p>
              <p className="mt-1 text-xs text-amber-300">
                require clarification
              </p>
            </div>
            <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-4">
              <p className="text-sm text-red-300 uppercase tracking-wide">
                ✗ Violation
              </p>
              <p className="mt-3 text-3xl font-bold text-red-400">1%</p>
              <p className="mt-1 text-xs text-red-300">need immediate action</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
