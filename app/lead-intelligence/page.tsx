"use client";

import { useState, useMemo } from "react";
import { Badge } from "../../components/ui/badge";
import { LeadIntelligenceCard } from "../../components/LeadIntelligenceCard";
import { syntheticLeads } from "../../data/leads";
import type {
  LeadProfile,
  PersonaTag,
  ScoreBand,
  LeadSegment,
} from "../../lib/types";
import { scoreLeadsWithIntelligence } from "../../lib/leadScoringEngine";

export default function LeadIntelligencePage() {
  const [selectedLead, setSelectedLead] = useState<
    (LeadProfile & { scoreIntelligence?: any }) | null
  >(null);
  const [bandFilter, setBandFilter] = useState<ScoreBand | "All">("All");
  const [segmentFilter, setSegmentFilter] = useState<LeadSegment | "All">(
    "All",
  );
  const [personaFilter, setPersonaFilter] = useState<PersonaTag | "All">("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [minAge, setMinAge] = useState(20);
  const [maxIncome, setMaxIncome] = useState(1500000);

  // Score all leads
  const scoredLeads = useMemo(() => {
    return scoreLeadsWithIntelligence(syntheticLeads);
  }, []);

  // Get unique filter options
  const allBands = useMemo(() => {
    return Array.from(
      new Set(
        scoredLeads.map((l) => l.scoreIntelligence?.scoreBand ?? "Medium"),
      ),
    ) as ScoreBand[];
  }, [scoredLeads]);

  const allSegments = useMemo(() => {
    return Array.from(
      new Set(scoredLeads.map((l) => l.segment)),
    ) as LeadSegment[];
  }, [scoredLeads]);

  const allPersonas = useMemo(() => {
    const personas = new Set<PersonaTag>();
    scoredLeads.forEach((l) => {
      l.personaTags?.forEach((p) => personas.add(p));
    });
    return Array.from(personas);
  }, [scoredLeads]);

  // Filter leads
  const filteredLeads = useMemo(() => {
    return scoredLeads.filter((lead) => {
      // Band filter
      if (
        bandFilter !== "All" &&
        (lead.scoreIntelligence?.scoreBand ?? "Medium") !== bandFilter
      ) {
        return false;
      }

      // Segment filter
      if (segmentFilter !== "All" && lead.segment !== segmentFilter) {
        return false;
      }

      // Persona filter
      if (
        personaFilter !== "All" &&
        !(lead.personaTags ?? []).includes(personaFilter)
      ) {
        return false;
      }

      // Search term
      if (
        searchTerm &&
        !lead.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !lead.city.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return false;
      }

      // Age filter
      if (lead.age < minAge) {
        return false;
      }

      // Income filter
      if (lead.income > maxIncome) {
        return false;
      }

      return true;
    });
  }, [
    scoredLeads,
    bandFilter,
    segmentFilter,
    personaFilter,
    searchTerm,
    minAge,
    maxIncome,
  ]);

  const bandCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    scoredLeads.forEach((lead) => {
      const band = lead.scoreIntelligence?.scoreBand ?? "Medium";
      counts[band] = (counts[band] ?? 0) + 1;
    });
    return counts;
  }, [scoredLeads]);

  return (
    <main className="min-h-screen bg-brand-surface text-slate-100">
      <div className="mx-auto max-w-7xl px-6 py-10">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-white mb-2">
            Lead Intelligence
          </h1>
          <p className="text-slate-300">
            Explore {scoredLeads.length} leads with business-value-aware
            scoring, personas, and acquisition insights
          </p>
        </div>

        {/* Controls */}
        <div className="rounded-lg border border-brand-border bg-brand-panel/50 p-6 mb-8 space-y-6">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Search by name or city
            </label>
            <input
              type="text"
              placeholder="e.g., Ananya, Mumbai"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-brand-border bg-brand-surface px-4 py-2 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Score Band Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">
              Priority Band
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setBandFilter("All")}
                className={`px-4 py-2 rounded-lg border transition-all ${
                  bandFilter === "All"
                    ? "border-blue-500 bg-blue-500/20 text-blue-300"
                    : "border-brand-border bg-brand-panel/50 text-slate-300 hover:border-slate-400"
                }`}
              >
                All ({scoredLeads.length})
              </button>
              {allBands.map((band) => (
                <button
                  key={band}
                  onClick={() => setBandFilter(band)}
                  className={`px-4 py-2 rounded-lg border transition-all ${
                    bandFilter === band
                      ? "border-green-500 bg-green-500/20 text-green-300"
                      : "border-brand-border bg-brand-panel/50 text-slate-300 hover:border-slate-400"
                  }`}
                >
                  {band} ({bandCounts[band] ?? 0})
                </button>
              ))}
            </div>
          </div>

          {/* Segment Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">
              Customer Segment
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSegmentFilter("All")}
                className={`px-3 py-1.5 text-sm rounded-lg border transition-all ${
                  segmentFilter === "All"
                    ? "border-blue-500 bg-blue-500/20 text-blue-300"
                    : "border-brand-border bg-brand-panel/50 text-slate-300 hover:border-slate-400"
                }`}
              >
                All
              </button>
              {allSegments.map((segment) => (
                <button
                  key={segment}
                  onClick={() => setSegmentFilter(segment)}
                  className={`px-3 py-1.5 text-sm rounded-lg border transition-all ${
                    segmentFilter === segment
                      ? "border-green-500 bg-green-500/20 text-green-300"
                      : "border-brand-border bg-brand-panel/50 text-slate-300 hover:border-slate-400"
                  }`}
                >
                  {segment}
                </button>
              ))}
            </div>
          </div>

          {/* Persona Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">
              Persona Tags
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setPersonaFilter("All")}
                className={`px-3 py-1.5 text-sm rounded-lg border transition-all ${
                  personaFilter === "All"
                    ? "border-blue-500 bg-blue-500/20 text-blue-300"
                    : "border-brand-border bg-brand-panel/50 text-slate-300 hover:border-slate-400"
                }`}
              >
                All
              </button>
              {allPersonas.map((persona) => (
                <button
                  key={persona}
                  onClick={() => setPersonaFilter(persona)}
                  className={`px-3 py-1.5 text-sm rounded-lg border transition-all ${
                    personaFilter === persona
                      ? "border-green-500 bg-green-500/20 text-green-300"
                      : "border-brand-border bg-brand-panel/50 text-slate-300 hover:border-slate-400"
                  }`}
                >
                  {persona}
                </button>
              ))}
            </div>
          </div>

          {/* Age & Income Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Minimum Age: {minAge}
              </label>
              <input
                type="range"
                min="18"
                max="70"
                value={minAge}
                onChange={(e) => setMinAge(Number(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Max Annual Income: ₹{(maxIncome / 100000).toFixed(0)}L
              </label>
              <input
                type="range"
                min="100000"
                max="3000000"
                step="100000"
                value={maxIncome}
                onChange={(e) => setMaxIncome(Number(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mb-6 text-slate-400">
          Showing{" "}
          <span className="font-semibold text-white">
            {filteredLeads.length}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-white">{scoredLeads.length}</span>{" "}
          leads
        </div>

        {/* Lead Grid */}
        {filteredLeads.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredLeads.map((lead) => (
              <LeadIntelligenceCard
                key={lead.id}
                lead={lead}
                onClick={() => setSelectedLead(lead)}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-brand-border bg-brand-panel/50 p-12 text-center">
            <p className="text-slate-300">
              No leads match your filters. Try adjusting your criteria.
            </p>
          </div>
        )}

        {/* Detail Drawer - Slide in from right */}
        {selectedLead && (
          <div className="fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <div
              className="flex-1 bg-black/50"
              onClick={() => setSelectedLead(null)}
            />

            {/* Panel */}
            <div className="w-full max-w-md bg-brand-panel border-l border-brand-border overflow-y-auto">
              <div className="sticky top-0 flex items-center justify-between bg-brand-panel/95 px-6 py-4 border-b border-brand-border">
                <h2 className="text-lg font-semibold text-white">
                  {selectedLead.name}
                </h2>
                <button
                  onClick={() => setSelectedLead(null)}
                  className="text-slate-400 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Score Intelligence */}
                {selectedLead.scoreIntelligence && (
                  <>
                    <div>
                      <h3 className="font-semibold text-white mb-4">
                        Score Breakdown
                      </h3>
                      <div className="space-y-3">
                        {selectedLead.scoreIntelligence.dimensions?.map(
                          (dim: any) => (
                            <div key={dim.name}>
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-sm text-slate-300">
                                  {dim.name}
                                </span>
                                <span className="font-semibold text-white">
                                  {dim.score}
                                </span>
                              </div>
                              <div className="h-2 bg-brand-surface rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                                  style={{
                                    width: `${(dim.score / 100) * 100}%`,
                                  }}
                                />
                              </div>
                            </div>
                          ),
                        )}
                      </div>
                    </div>

                    {/* Composite Score */}
                    <div className="bg-brand-surface/50 rounded-lg p-4 border border-brand-border">
                      <div className="text-center">
                        <div className="text-sm text-slate-400 mb-1">
                          Composite Score
                        </div>
                        <div className="text-4xl font-bold text-white mb-2">
                          {selectedLead.scoreIntelligence.compositeScore}
                        </div>
                        <Badge>
                          {selectedLead.scoreIntelligence.scoreBand}
                        </Badge>
                      </div>
                    </div>
                  </>
                )}

                {/* Profile */}
                <div>
                  <h3 className="font-semibold text-white mb-3">Profile</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Age</span>
                      <span className="text-white">{selectedLead.age}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Annual Income</span>
                      <span className="text-white">
                        ₹{(selectedLead.income / 100000).toFixed(1)}L
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Digital Affinity</span>
                      <span className="text-white">
                        {selectedLead.digitalAffinity}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Segment</span>
                      <span className="text-white">{selectedLead.segment}</span>
                    </div>
                  </div>
                </div>

                {/* Positive Factors */}
                {selectedLead.topPositiveFactors &&
                  selectedLead.topPositiveFactors.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-green-400 mb-3">
                        ✓ Positive Factors
                      </h3>
                      <ul className="space-y-2 text-sm">
                        {selectedLead.topPositiveFactors.map((factor, i) => (
                          <li key={i} className="flex gap-2 text-slate-300">
                            <span className="text-green-400">•</span>
                            <span>{factor}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                {/* Risk Factors */}
                {selectedLead.topRiskFactors &&
                  selectedLead.topRiskFactors.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-amber-400 mb-3">
                        ⚠ Risk Factors
                      </h3>
                      <ul className="space-y-2 text-sm">
                        {selectedLead.topRiskFactors.map((factor, i) => (
                          <li key={i} className="flex gap-2 text-slate-300">
                            <span className="text-amber-400">•</span>
                            <span>{factor}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                {/* Acquisition Route */}
                {selectedLead.recommendedAcquisitionRoute && (
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                    <div className="text-xs text-slate-400 mb-1">
                      Recommended Acquisition Route
                    </div>
                    <div className="text-white font-semibold">
                      {selectedLead.recommendedAcquisitionRoute}
                    </div>
                  </div>
                )}

                {/* Persona */}
                {selectedLead.personaTags &&
                  selectedLead.personaTags.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-white mb-3">
                        Persona Tags
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedLead.personaTags.map((tag) => (
                          <Badge key={tag}>{tag}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Products & History */}
                {selectedLead.previousProducts.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-white mb-3">
                      Previous Products
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedLead.previousProducts.map((product, i) => (
                        <Badge key={i} variant="success">
                          {product}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Challenge & Motivation */}
                <div className="bg-brand-surface/50 rounded-lg p-4 border border-brand-border">
                  <div className="mb-3">
                    <h4 className="text-xs text-slate-400 font-semibold mb-1 uppercase">
                      Challenge
                    </h4>
                    <p className="text-sm text-slate-300">
                      {selectedLead.challengeSummary}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-xs text-slate-400 font-semibold mb-1 uppercase">
                      Motivation
                    </h4>
                    <p className="text-sm text-slate-300">
                      {selectedLead.persona.motivation}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
