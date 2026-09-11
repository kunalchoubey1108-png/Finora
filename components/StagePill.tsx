import type { JourneyStageStatus } from "../lib/types";
import { Badge } from "./ui/badge";

export function StagePill({ stage }: { stage: JourneyStageStatus }) {
  const variant =
    stage.status === "Completed"
      ? "success"
      : stage.status === "Review Required"
        ? "warning"
        : "default";

  return (
    <div className="rounded-3xl border border-brand-border bg-brand-surface/80 p-4">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm uppercase tracking-[0.18em] text-brand.muted">
          {stage.stage}
        </p>
        <Badge variant={variant}>{stage.status}</Badge>
      </div>
      <p className="mt-3 text-sm text-brand.muted">{stage.decisionSummary}</p>
      <p className="mt-3 text-xs text-brand.highlight">
        Confidence: {stage.confidence}% · {stage.governanceAction}
      </p>
    </div>
  );
}
