"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { AgentFlowReport, AgentExecutionResult } from "../../lib/types";
import { Badge } from "../../components/ui/badge";

function formatTimestamp(timestamp: string): string {
  return new Date(timestamp).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function formatDuration(start: string, end: string): string {
  const ms = new Date(end).getTime() - new Date(start).getTime();
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
}

function getStatusBadgeVariant(
  status: AgentExecutionResult["status"],
): "success" | "warning" | "default" {
  if (status === "Completed") return "success";
  if (status === "Escalated") return "warning";
  return "default";
}

export default function AgentFlowPage() {
  const [report, setReport] = useState<AgentFlowReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAgent, setSelectedAgent] =
    useState<AgentExecutionResult | null>(null);

  useEffect(() => {
    async function fetchFlow() {
      try {
        setLoading(true);
        const response = await fetch("/api/agent-flow");
        if (!response.ok) throw new Error("Failed to fetch agent flow");
        const data: AgentFlowReport = await response.json();
        setReport(data);
        if (data.agentResults.length > 0) {
          setSelectedAgent(data.agentResults[0]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    fetchFlow();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-brand-surface text-slate-100">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <div className="rounded-3xl border border-brand-border bg-brand-panel/80 p-12">
            <p className="text-center text-lg text-brand.muted">
              Loading agent orchestration flow…
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (error || !report) {
    return (
      <main className="min-h-screen bg-brand-surface text-slate-100">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <div className="rounded-3xl border border-brand-border bg-brand-panel/80 p-12">
            <p className="text-center text-lg text-red-400">
              {error || "Failed to load agent flow"}
            </p>
          </div>
        </div>
      </main>
    );
  }

  const duration = formatDuration(report.startedAt, report.finishedAt);

  return (
    <main className="editorial-page">
      <div className="editorial-container py-10 md:py-16">
        <Link
          href="/"
          className="text-sm text-[#17191c] hover:underline"
        >
          ← Back to dashboard
        </Link>

        <section className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div>
            <p className="editorial-eyebrow">Live orchestration trace</p>
            <h1 className="editorial-title mt-3 max-w-3xl">Every decision, <em>made visible.</em></h1>
            <p className="editorial-subhead mt-5">Inspect the agent sequence, the reasoning behind every recommendation, and the point where human review is required.</p>
          </div>
          <div className="editorial-peach p-6">
            <p className="text-sm">Selected lead</p>
            <p className="font-display mt-2 text-3xl tracking-[-0.03em]">{report.selectedLeadName}</p>
            <p className="mt-3 text-sm">{report.selectedLeadSegment} · {report.journeyState.humanActionRequired ? "Review required" : "Auto path complete"}</p>
          </div>
        </section>

        <section className="mt-10 grid gap-4 md:grid-cols-4">
            <div className="rounded-2xl bg-brand-surface p-6">
              <p className="editorial-eyebrow">Started</p>
              <p className="mt-2 text-sm font-semibold text-white">
                {formatTimestamp(report.startedAt)}
              </p>
            </div>
            <div className="rounded-2xl bg-brand-surface p-6">
              <p className="editorial-eyebrow">Duration</p>
              <p className="mt-2 text-sm font-semibold text-white">
                {duration}
              </p>
            </div>
            <div className="rounded-2xl bg-brand-surface p-6">
              <p className="editorial-eyebrow">Agent count</p>
              <p className="mt-2 text-sm font-semibold text-white">
                {report.agentResults.length}
              </p>
            </div>
            <div className="rounded-2xl bg-brand-surface p-6">
              <p className="editorial-eyebrow">Execution ID</p>
              <p className="mt-2 text-sm font-semibold text-white">
                {report.executionId.slice(-12)}
              </p>
            </div>
        </section>

        <div className="mt-12 grid gap-6 lg:grid-cols-[0.82fr_1.45fr]">
          <div className="space-y-4">
            <div><p className="editorial-eyebrow">Decision path</p><h2 className="font-display mt-1 text-3xl tracking-[-0.03em]">Agent sequence</h2></div>
            <div className="space-y-2">
              {report.agentResults.map((agent: AgentExecutionResult) => (
                <button
                  key={agent.auditLogId}
                  onClick={() => setSelectedAgent(agent)}
                  className={`w-full rounded-2xl border p-5 text-left transition ${
                    selectedAgent?.auditLogId === agent.auditLogId
                      ? "border-[#17191c] bg-white shadow-[0_8px_24px_rgba(0,0,0,0.06)]"
                      : "border-transparent bg-[#f2f2f3] hover:bg-white"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-[#17191c]">
                        {agent.agentName}
                      </p>
                      <p className="mt-2 text-xs leading-5 text-[#777b86] line-clamp-2">
                        {agent.decision}
                      </p>
                    </div>
                    <Badge variant={getStatusBadgeVariant(agent.status)}>
                      {agent.status}
                    </Badge>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {selectedAgent && (
            <div className="editorial-artifact p-6 md:p-8">
              <p className="editorial-eyebrow">Selected agent</p>
              <h3 className="font-display mt-2 text-4xl tracking-[-0.03em]">
                {selectedAgent.agentName}
              </h3>

              <div className="mt-8 space-y-6">
                <div>
                  <p className="editorial-eyebrow">Status</p>
                  <div className="mt-2">
                    <Badge
                      variant={getStatusBadgeVariant(selectedAgent.status)}
                    >
                      {selectedAgent.status}
                    </Badge>
                  </div>
                </div>

                <div>
                  <p className="editorial-eyebrow">Confidence</p>
                  <div className="mt-2 flex items-center gap-3">
                    <div className="flex-1 rounded-full bg-brand-surface h-2">
                      <div
                        className="h-2 rounded-full bg-[#17191c]"
                        style={{
                          width: `${selectedAgent.confidence}%`,
                        }}
                      />
                    </div>
                    <p className="text-sm font-semibold text-white">
                      {selectedAgent.confidence}%
                    </p>
                  </div>
                </div>

                <div>
                  <p className="editorial-eyebrow">Decision</p>
                  <p className="mt-2 text-sm leading-6 text-[#17191c]">
                    {selectedAgent.decision}
                  </p>
                </div>

                <div>
                  <p className="editorial-eyebrow">Reasoning</p>
                  <p className="mt-2 text-sm text-[#777b86] leading-6">
                    {selectedAgent.reasoningSummary}
                  </p>
                </div>

                <div>
                  <p className="editorial-eyebrow">
                    Execution Time
                  </p>
                  <p className="mt-2 text-sm text-slate-100">
                    {formatTimestamp(selectedAgent.timestamp)}
                  </p>
                </div>

                <div>
                  <p className="editorial-eyebrow">Agent input</p>
                  <pre className="mt-2 rounded-2xl bg-[#f2f2f3] p-4 text-xs overflow-auto max-h-[150px] text-[#17191c]">
                    {JSON.stringify(selectedAgent.input, null, 2)}
                  </pre>
                </div>

                <div>
                  <p className="editorial-eyebrow">Agent output</p>
                  <pre className="mt-2 rounded-2xl bg-[#f2f2f3] p-4 text-xs overflow-auto max-h-[200px] text-[#17191c]">
                    {JSON.stringify(selectedAgent.output, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>

        <section className="mt-12 bg-[#fafafb] p-6 md:p-10">
          <p className="editorial-eyebrow">System record</p>
          <h2 className="font-display mt-2 text-4xl tracking-[-0.03em]">Execution timeline</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {report.timeline.map(
              (step: (typeof report.timeline)[0], idx: number) => (
                <div key={idx} className="rounded-2xl bg-white p-5">
                    <p className="text-xs text-[#979799]">{String(idx + 1).padStart(2, "0")}</p>
                    <p className="mt-3 text-sm font-medium text-[#17191c]">{step.step}</p>
                    <p className="mt-2 text-sm leading-6 text-[#777b86]">{step.detail}</p>
                  </div>
              ),
            )}
          </div>
        </section>

        <section className="mt-12 grid gap-6 md:grid-cols-[0.75fr_1.25fr]">
          <div><p className="editorial-eyebrow">Governance</p><h2 className="editorial-section-title mt-2">Review, where it matters.</h2></div>
          <div className="editorial-card p-6">
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-white p-4">
              <p className="editorial-eyebrow">Review level</p>
              <p className="mt-2 font-semibold text-white">
                {report.governance.reviewLevel}
              </p>
            </div>
            <div className="rounded-2xl bg-white p-4">
              <p className="editorial-eyebrow">Recommended reviewer</p>
              <p className="mt-2 font-semibold text-white">
                {report.governance.recommendedReviewer}
              </p>
            </div>
            <div className="col-span-full rounded-2xl bg-white p-4">
              <p className="editorial-eyebrow">Risk note</p>
              <p className="mt-2 text-sm text-[#777b86] leading-6">
                {report.governance.riskNote}
              </p>
            </div>
          </div>
          </div>
        </section>
      </div>
    </main>
  );
}
