"use client";

import type { ComplianceFlag } from "../lib/types";

export function CompliancePanel({ flags }: { flags: ComplianceFlag[] }) {
  if (!flags || flags.length === 0) {
    return (
      <div className="rounded-2xl bg-brand-surface/80 p-4 text-sm text-slate-300">
        No compliance flags detected.
      </div>
    );
  }

  const messages: Record<ComplianceFlag, string> = {
    "exaggerated-claims":
      "Avoid absolute guarantees; provide clear terms and qualifiers.",
    "misleading-urgency":
      "Include informational language and explicit terms to avoid pressured decisions.",
    "unclear-offer-wording":
      "Clarify any 'free' or 'zero' claims with eligibility and terms.",
  };

  return (
    <div className="rounded-2xl bg-amber-900/10 border border-amber-700 p-4">
      <div className="text-sm font-semibold text-amber-200">
        Compliance flags
      </div>
      <ul className="mt-3 text-sm text-amber-100 space-y-2">
        {flags.map((f) => (
          <li key={f}>• {messages[f]}</li>
        ))}
      </ul>
    </div>
  );
}
