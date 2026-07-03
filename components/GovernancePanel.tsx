import type { GovernanceSummary } from "../lib/types";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";

export function GovernancePanel({ summary }: { summary: GovernanceSummary }) {
  return (
    <Card className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-sbi.muted">
            Governance & Compliance
          </p>
          <h3 className="mt-2 text-xl font-semibold text-white">
            Review-first decision support
          </h3>
        </div>
        <Badge variant={summary.humanOverrideRequired ? "warning" : "success"}>
          {summary.humanOverrideRequired ? "Override Required" : "Auto Approve"}
        </Badge>
      </div>
      <p className="text-sm leading-7 text-sbi.muted">{summary.riskNote}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-sbi-surface/70 p-4">
          <p className="text-sm uppercase tracking-[0.16em] text-sbi.muted">
            Assigned reviewer
          </p>
          <p className="mt-2 font-semibold text-white">
            {summary.recommendedReviewer}
          </p>
        </div>
        <div className="rounded-2xl bg-sbi-surface/70 p-4">
          <p className="text-sm uppercase tracking-[0.16em] text-sbi.muted">
            Control signals
          </p>
          <ul className="mt-2 space-y-2 text-sm text-sbi.muted">
            {summary.controlSignals.map((signal) => (
              <li key={signal}>• {signal}</li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  );
}
