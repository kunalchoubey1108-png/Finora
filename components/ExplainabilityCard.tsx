"use client";

import { Badge } from "./ui/badge";

export type ExplainabilityCardProps = {
  agentName: string;
  decision: string;
  confidence: number;
  topFactors: string[];
  alternativeRecommendation?: string;
  escalationReason?: string;
  isEscalated: boolean;
};

export function ExplainabilityCard({
  agentName,
  decision,
  confidence,
  topFactors,
  alternativeRecommendation,
  escalationReason,
  isEscalated,
}: ExplainabilityCardProps) {
  const confidentEnough = confidence >= 85;

  return (
    <div className="rounded-2xl border border-brand-border bg-brand-panel/80 p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase text-brand.muted">Agent Decision</p>
          <p className="mt-2 font-semibold text-white">{agentName}</p>
        </div>
        <Badge
          variant={
            isEscalated ? "warning" : confidentEnough ? "success" : "default"
          }
        >
          {isEscalated ? "Escalated" : confidentEnough ? "Confident" : "Review"}
        </Badge>
      </div>

      <div>
        <p className="text-xs uppercase text-brand.muted">Decision</p>
        <p className="mt-2 text-sm text-slate-100 leading-relaxed">
          {decision}
        </p>
      </div>

      <div>
        <p className="text-xs uppercase text-brand.muted">Decision Confidence</p>
        <div className="mt-3 flex items-center gap-3">
          <div className="flex-1 rounded-full bg-brand-surface h-2.5 overflow-hidden">
            <div
              className={`h-2.5 rounded-full transition-all ${
                confidence >= 90
                  ? "bg-gradient-to-r from-green-500 to-emerald-400"
                  : confidence >= 80
                    ? "bg-gradient-to-r from-blue-500 to-cyan-400"
                    : "bg-gradient-to-r from-amber-500 to-orange-400"
              }`}
              style={{ width: `${confidence}%` }}
            />
          </div>
          <span className="text-sm font-semibold text-white min-w-[2.5rem]">
            {confidence}%
          </span>
        </div>
      </div>

      <div>
        <p className="text-xs uppercase text-brand.muted">Top Factors</p>
        <ul className="mt-2 space-y-1">
          {topFactors.map((factor, idx) => (
            <li
              key={idx}
              className="text-xs text-slate-300 flex items-start gap-2"
            >
              <span className="text-brand.accent mt-1">•</span>
              <span>{factor}</span>
            </li>
          ))}
        </ul>
      </div>

      {alternativeRecommendation && (
        <div className="rounded-lg bg-brand-surface/50 border border-brand-border/30 p-3">
          <p className="text-xs uppercase text-brand.muted">Alternative Option</p>
          <p className="mt-1 text-xs text-slate-300">
            {alternativeRecommendation}
          </p>
        </div>
      )}

      {isEscalated && escalationReason && (
        <div className="rounded-lg bg-amber-500/10 border border-amber-500/30 p-3">
          <p className="text-xs uppercase text-amber-400">Escalation Reason</p>
          <p className="mt-1 text-xs text-amber-100">{escalationReason}</p>
        </div>
      )}
    </div>
  );
}
