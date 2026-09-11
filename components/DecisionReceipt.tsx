"use client";

import type { DecisionReceipt, ManualOverride } from "../lib/types";
import { Badge } from "./ui/badge";

export type DecisionReceiptProps = {
  receipt: DecisionReceipt;
  onDownload?: () => void;
  onArchive?: () => void;
};

export function DecisionReceiptCard({
  receipt,
  onDownload,
  onArchive,
}: DecisionReceiptProps) {
  const outcomeColors: Record<string, string> = {
    approved: "bg-green-500/10 border-green-500/30 text-green-400",
    rejected: "bg-red-500/10 border-red-500/30 text-red-400",
    manual_review: "bg-amber-500/10 border-amber-500/30 text-amber-400",
    escalated: "bg-purple-500/10 border-purple-500/30 text-purple-400",
  };

  const outcomeLabel: Record<string, string> = {
    approved: "✓ Approved",
    rejected: "✗ Rejected",
    manual_review: "👤 Manual Review",
    escalated: "⚠ Escalated",
  };

  return (
    <div className="rounded-2xl border border-brand-border bg-brand-panel/80 p-6 space-y-6">
      <div className="flex items-start justify-between border-b border-brand-border pb-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-brand.muted">
            Decision Receipt
          </p>
          <p className="mt-1 font-mono text-xs text-slate-400">
            {receipt.receiptId}
          </p>
          <h3 className="mt-3 text-xl font-semibold text-white">
            {receipt.leadName}
          </h3>
        </div>
        <Badge
          variant={
            receipt.governanceStatus === "passed" ? "success" : "warning"
          }
        >
          {receipt.governanceStatus.replace("_", " ")}
        </Badge>
      </div>

      <div
        className={`rounded-xl border p-4 ${outcomeColors[receipt.journeyOutcome] || "bg-slate-500/10"}`}
      >
        <p className="text-sm font-semibold">
          {outcomeLabel[receipt.journeyOutcome] || "Unknown"}
        </p>
        <p className="mt-2 text-sm leading-relaxed">
          {receipt.decisionSummary}
        </p>
      </div>

      <div>
        <p className="text-sm font-semibold text-white mb-3">
          Decision Drivers
        </p>
        <ul className="space-y-2">
          {receipt.keyFactors.map((factor: string, idx: number) => (
            <li
              key={idx}
              className="flex items-start gap-2 text-sm text-slate-300"
            >
              <span className="text-brand.accent mt-1">→</span>
              <span>{factor}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg bg-brand-surface/50 p-3">
          <p className="text-xs uppercase text-brand.muted">
            Decision Confidence
          </p>
          <div className="mt-3 flex items-end gap-2">
            <div className="flex-1 rounded-full bg-brand-border h-2">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-brand.accent to-brand.highlight"
                style={{ width: `${receipt.confidence}%` }}
              />
            </div>
            <span className="text-lg font-bold text-white">
              {receipt.confidence}%
            </span>
          </div>
        </div>
        <div className="rounded-lg bg-brand-surface/50 p-3">
          <p className="text-xs uppercase text-brand.muted">Valid Until</p>
          <p className="mt-3 text-sm font-semibold text-white">
            {new Date(receipt.validUntil).toLocaleDateString("en-IN")}
          </p>
        </div>
      </div>

      {receipt.overrides.length > 0 && (
        <div className="rounded-lg bg-amber-500/5 border border-amber-500/20 p-4">
          <p className="text-sm font-semibold text-amber-300 mb-3">
            Manual Overrides Applied
          </p>
          <div className="space-y-2">
            {receipt.overrides.map((override: ManualOverride) => (
              <div
                key={override.id}
                className="text-xs bg-brand-surface/50 rounded p-2 border border-amber-500/10"
              >
                <p className="text-amber-200 font-mono">
                  {override.overriddenField}
                </p>
                <p className="text-slate-300 mt-1">{override.reason}</p>
                <p className="text-slate-500 text-xs mt-1">
                  By: {override.overriddenBy}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {receipt.reviewedBy && (
        <div className="rounded-lg bg-green-500/5 border border-green-500/20 p-3">
          <p className="text-xs text-green-300">
            Reviewed and approved by <strong>{receipt.reviewedBy}</strong> on{" "}
            {new Date(receipt.timestamp).toLocaleDateString("en-IN")}
          </p>
        </div>
      )}

      <div className="flex gap-3 pt-4 border-t border-brand-border">
        <button
          onClick={onDownload}
          className="flex-1 rounded-lg bg-brand.accent/10 border border-brand.accent/30 px-4 py-2 text-sm font-semibold text-brand.accent hover:bg-brand.accent/20 transition"
        >
          Download Receipt
        </button>
        <button
          onClick={onArchive}
          className="flex-1 rounded-lg bg-brand-surface/50 border border-brand-border px-4 py-2 text-sm font-semibold text-slate-300 hover:border-brand.accent/50 transition"
        >
          Archive
        </button>
      </div>
    </div>
  );
}
