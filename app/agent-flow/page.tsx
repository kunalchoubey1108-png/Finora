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
    <main className="min-h-screen bg-brand-surface text-slate-100">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-brand.highlight hover:text-brand.accent transition"
        >
          ← Back to Dashboard
        </Link>

        <section className="mt-8 rounded-[2rem] border border-brand-border bg-brand-panel/90 p-8 shadow-panel backdrop-blur-xl">
          <div className="space-y-4">
            <Badge>Multi-Agent Orchestration Flow</Badge>
            <h1 className="text-4xl font-semibold text-white">
              Agent Execution Pipeline
            </h1>
            <p className="max-w-3xl text-lg text-brand.muted">
              Execution ID:{" "}
              <code className="text-brand.highlight">{report.executionId}</code>
            </p>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-4">
            <div className="rounded-2xl bg-brand-surface p-6">
              <p className="text-xs uppercase text-brand.muted">Started</p>
              <p className="mt-2 text-sm font-semibold text-white">
                {formatTimestamp(report.startedAt)}
              </p>
            </div>
            <div className="rounded-2xl bg-brand-surface p-6">
              <p className="text-xs uppercase text-brand.muted">Duration</p>
              <p className="mt-2 text-sm font-semibold text-white">
                {duration}
              </p>
            </div>
            <div className="rounded-2xl bg-brand-surface p-6">
              <p className="text-xs uppercase text-brand.muted">Agent Count</p>
              <p className="mt-2 text-sm font-semibold text-white">
                {report.agentResults.length}
              </p>
            </div>
            <div className="rounded-2xl bg-brand-surface p-6">
              <p className="text-xs uppercase text-brand.muted">Lead Selected</p>
              <p className="mt-2 text-sm font-semibold text-white">
                {report.selectedLeadName}
              </p>
            </div>
          </div>
        </section>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.5fr]">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white">Agent Queue</h2>
            <div className="space-y-2">
              {report.agentResults.map((agent: AgentExecutionResult) => (
                <button
                  key={agent.auditLogId}
                  onClick={() => setSelectedAgent(agent)}
                  className={`w-full rounded-xl border p-4 text-left transition ${
                    selectedAgent?.auditLogId === agent.auditLogId
                      ? "border-brand.accent bg-brand-panel/80"
                      : "border-brand-border bg-brand-surface/50 hover:border-brand.accent/50"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-white">
                        {agent.agentName}
                      </p>
                      <p className="mt-1 text-xs text-brand.muted line-clamp-1">
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
            <div className="rounded-2xl border border-brand-border bg-brand-panel/80 p-6">
              <h3 className="text-lg font-semibold text-white">
                {selectedAgent.agentName}
              </h3>

              <div className="mt-4 space-y-4">
                <div>
                  <p className="text-xs uppercase text-brand.muted">Status</p>
                  <div className="mt-2">
                    <Badge
                      variant={getStatusBadgeVariant(selectedAgent.status)}
                    >
                      {selectedAgent.status}
                    </Badge>
                  </div>
                </div>

                <div>
                  <p className="text-xs uppercase text-brand.muted">Confidence</p>
                  <div className="mt-2 flex items-center gap-3">
                    <div className="flex-1 rounded-full bg-brand-surface h-2">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-brand.accent to-brand.highlight"
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
                  <p className="text-xs uppercase text-brand.muted">Decision</p>
                  <p className="mt-2 text-sm text-slate-100">
                    {selectedAgent.decision}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase text-brand.muted">Reasoning</p>
                  <p className="mt-2 text-sm text-slate-300 leading-relaxed">
                    {selectedAgent.reasoningSummary}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase text-brand.muted">
                    Execution Time
                  </p>
                  <p className="mt-2 text-sm text-slate-100">
                    {formatTimestamp(selectedAgent.timestamp)}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase text-brand.muted">Input</p>
                  <pre className="mt-2 rounded-lg bg-brand-surface p-3 text-xs overflow-auto max-h-[150px]">
                    {JSON.stringify(selectedAgent.input, null, 2)}
                  </pre>
                </div>

                <div>
                  <p className="text-xs uppercase text-brand.muted">Output</p>
                  <pre className="mt-2 rounded-lg bg-brand-surface p-3 text-xs overflow-auto max-h-[200px]">
                    {JSON.stringify(selectedAgent.output, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>

        <section className="mt-8 rounded-2xl border border-brand-border bg-brand-panel/80 p-6">
          <h2 className="text-lg font-semibold text-white">
            Execution Timeline
          </h2>
          <div className="mt-6 space-y-6">
            {report.timeline.map(
              (step: (typeof report.timeline)[0], idx: number) => (
                <div key={idx} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="rounded-full bg-brand.accent w-3 h-3" />
                    {idx < report.timeline.length - 1 && (
                      <div className="w-1 h-16 bg-brand-border/50 mt-1" />
                    )}
                  </div>
                  <div className="pb-4">
                    <p className="font-semibold text-white">{step.step}</p>
                    <p className="mt-1 text-sm text-slate-300">{step.detail}</p>
                  </div>
                </div>
              ),
            )}
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-brand-border bg-brand-panel/80 p-6">
          <h2 className="text-lg font-semibold text-white">
            Governance Summary
          </h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl bg-brand-surface p-4">
              <p className="text-xs uppercase text-brand.muted">Review Level</p>
              <p className="mt-2 font-semibold text-white">
                {report.governance.reviewLevel}
              </p>
            </div>
            <div className="rounded-xl bg-brand-surface p-4">
              <p className="text-xs uppercase text-brand.muted">
                Recommended Reviewer
              </p>
              <p className="mt-2 font-semibold text-white">
                {report.governance.recommendedReviewer}
              </p>
            </div>
            <div className="col-span-full rounded-xl bg-brand-surface p-4">
              <p className="text-xs uppercase text-brand.muted">Risk Note</p>
              <p className="mt-2 text-sm text-slate-100 leading-relaxed">
                {report.governance.riskNote}
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
