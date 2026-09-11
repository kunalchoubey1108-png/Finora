import type { AuditRecord } from "../lib/types";

export function AuditTimeline({ audit }: { audit: AuditRecord[] }) {
  return (
    <div className="space-y-4">
      {audit.map((entry) => (
        <div
          key={entry.id}
          className="rounded-3xl border border-brand-border bg-brand-surface/80 p-5"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold text-white">{entry.step}</p>
            <span className="text-xs uppercase tracking-[0.2em] text-brand.muted">
              {new Date(entry.timestamp).toLocaleString("en-IN", {
                dateStyle: "short",
                timeStyle: "short",
              })}
            </span>
          </div>
          <p className="mt-3 text-sm text-brand.muted">{entry.rationale}</p>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-brand.highlight">
            <span>Decision: {entry.decision}</span>
            <span>Confidence: {entry.confidence}%</span>
            <span>
              {entry.reviewRequired ? "Review required" : "Auto-approved"}
            </span>
          </div>
          <p className="mt-3 text-sm text-brand.muted">
            Assigned to: {entry.assignedTo}
          </p>
          {entry.notes && (
            <p className="mt-2 text-sm text-brand.muted">Notes: {entry.notes}</p>
          )}
        </div>
      ))}
    </div>
  );
}
