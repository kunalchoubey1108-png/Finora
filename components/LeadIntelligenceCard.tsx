"use client";

import type { LeadProfile } from "../lib/types";
import { Badge } from "./ui/badge";

export interface LeadIntelligenceCardProps {
  lead: LeadProfile & { scoreIntelligence?: any };
  onClick: () => void;
}

export function LeadIntelligenceCard({
  lead,
  onClick,
}: LeadIntelligenceCardProps) {
  const composite =
    lead.scoreIntelligence?.compositeScore ?? lead.score.confidence ?? 0;
  const band = lead.scoreIntelligence?.scoreBand ?? "Medium";
  const ltv =
    lead.scoreIntelligence?.expectedValue ?? lead.score.businessValue ?? 0;
  const tags = lead.personaTags ?? [];

  const bandColors: Record<string, string> = {
    "Strategic Priority":
      "bg-gradient-to-r from-purple-900 to-purple-700 border-purple-600",
    High: "bg-gradient-to-r from-green-900 to-emerald-700 border-green-600",
    Medium: "bg-gradient-to-r from-blue-900 to-blue-700 border-blue-600",
    Low: "bg-gradient-to-r from-amber-900 to-orange-700 border-amber-600",
  };

  const bandTextColors: Record<string, string> = {
    "Strategic Priority": "text-purple-300",
    High: "text-green-300",
    Medium: "text-blue-300",
    Low: "text-amber-300",
  };

  return (
    <div
      onClick={onClick}
      className={`rounded-lg border p-4 cursor-pointer transition-all hover:shadow-lg hover:scale-105 ${bandColors[band] || bandColors.Medium}`}
    >
      {/* Header: Name + Score Band */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white truncate">{lead.name}</h3>
          <p className="text-sm text-gray-300">{lead.city}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <div className={`text-lg font-bold ${bandTextColors[band]}`}>
            {composite}
          </div>
          <div className="text-xs text-gray-300">{band}</div>
        </div>
      </div>

      {/* Persona Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {tags.slice(0, 2).map((tag) => (
            <Badge key={tag}>{tag}</Badge>
          ))}
          {tags.length > 2 && <Badge>+{tags.length - 2}</Badge>}
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-3 gap-2 mb-3 text-sm">
        <div className="bg-white/10 rounded p-2">
          <div className="text-xs text-gray-300">LTV</div>
          <div className="font-semibold text-white">
            ₹{(ltv / 100000).toFixed(1)}L
          </div>
        </div>
        <div className="bg-white/10 rounded p-2">
          <div className="text-xs text-gray-300">Age</div>
          <div className="font-semibold text-white">{lead.age}</div>
        </div>
        <div className="bg-white/10 rounded p-2">
          <div className="text-xs text-gray-300">Digital</div>
          <div className="font-semibold text-white">
            {lead.digitalAffinity}%
          </div>
        </div>
      </div>

      {/* Segment + CTA */}
      <div className="flex items-center justify-between">
        <Badge>{lead.segment}</Badge>
        <span className="text-white/70">→</span>
      </div>
    </div>
  );
}
