"use client";

import { useMemo, useState, useEffect } from "react";
import { syntheticLeads } from "../../data/leads";
import { generateContentVariants } from "../../lib/contentPersonalizationEngine";
import { CompliancePanel } from "../../components/CompliancePanel";
import type {
  Channel,
  LanguageOption,
  PersonaCategory,
  ToneVariant,
} from "../../lib/types";

const channels: Channel[] = ["email", "sms", "whatsapp", "push"];
const languages: LanguageOption[] = ["English", "Hindi", "Hinglish"];
const personas: PersonaCategory[] = [
  "salaried professional",
  "student",
  "merchant",
  "premium user",
  "self-employed",
];
const tones: ToneVariant[] = [
  "formal",
  "friendly",
  "premium",
  "urgent-but-compliant",
];

export default function ContentStudioPage() {
  const [leadId, setLeadId] = useState(syntheticLeads[0]?.id ?? "");
  const [channel, setChannel] = useState<Channel>("email");
  const [language, setLanguage] = useState<LanguageOption>("English");
  const [persona, setPersona] = useState<PersonaCategory>(
    "salaried professional",
  );

  const lead = useMemo(
    () => syntheticLeads.find((l) => l.id === leadId) || syntheticLeads[0],
    [leadId],
  );

  const result = useMemo(
    () => generateContentVariants(lead, channel, language, persona),
    [leadId, channel, language, persona],
  );

  const bestVariant = useMemo(
    () =>
      result.variants.reduce((a, b) =>
        a.engagementScore >= b.engagementScore ? a : b,
      ),
    [result],
  );

  const [selectedVariant, setSelectedVariant] = useState(
    result.variants?.[0] ?? result.genericVariant,
  );
  const [actionStatus, setActionStatus] = useState<string | null>(null);
  const [queue, setQueue] = useState<any[]>([]);

  function loadQueue() {
    try {
      const key = "content-studio-sent";
      const existing = JSON.parse(localStorage.getItem(key) || "[]");
      setQueue(Array.isArray(existing) ? existing.slice().reverse() : []);
    } catch (e) {
      console.error("Failed to load queue", e);
      setQueue([]);
    }
  }

  useEffect(() => {
    setSelectedVariant(
      result.variants?.reduce((a, b) =>
        a.engagementScore >= b.engagementScore ? a : b,
      ) ?? result.genericVariant,
    );
    loadQueue();
  }, [result]);

  function saveToLocalQueue(action: string, payload: any) {
    try {
      const key = "content-studio-sent";
      const existing = JSON.parse(localStorage.getItem(key) || "[]");
      existing.push({
        id: Date.now(),
        action,
        payload,
        timestamp: new Date().toISOString(),
      });
      localStorage.setItem(key, JSON.stringify(existing));
      loadQueue();
      console.log("Saved to local queue", { action, payload });
      setActionStatus("Saved to local queue");
      setTimeout(() => setActionStatus(null), 3000);
    } catch (e) {
      console.error(e);
      setActionStatus("Save failed");
      setTimeout(() => setActionStatus(null), 3000);
    }
  }

  function downloadJSON(filename: string, data: any) {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setActionStatus("Export started");
    setTimeout(() => setActionStatus(null), 2000);
  }

  function handleSendSelected() {
    const payload = {
      leadId: lead.id,
      channel,
      language,
      persona,
      variant: selectedVariant,
    };
    saveToLocalQueue("send_to_journey", payload);
  }

  function handleExportAll() {
    downloadJSON(`content_export_${lead.id}_${Date.now()}.json`, {
      lead,
      channel,
      language,
      persona,
      result,
    });
  }

  async function handleReplayQueueItem(item: any) {
    if (!item?.payload) return;
    try {
      setActionStatus("Sending to orchestrator...");
      const res = await fetch("/api/orchestrate/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item.payload),
      });
      const data = await res.json();
      if (res.ok) {
        // remove the item from local queue after successful server enqueue
        handleDeleteQueueItem(item.id);
        setActionStatus("Sent to orchestrator");
      } else {
        console.error("Orchestrator error", data);
        setActionStatus("Orchestrator error");
      }
    } catch (e) {
      console.error(e);
      setActionStatus("Send failed");
    }
    setTimeout(() => setActionStatus(null), 2000);
  }

  function handleDeleteQueueItem(id: number) {
    try {
      const key = "content-studio-sent";
      const existing = JSON.parse(localStorage.getItem(key) || "[]");
      const updated = (existing || []).filter((it: any) => it.id !== id);
      localStorage.setItem(key, JSON.stringify(updated));
      loadQueue();
      setActionStatus("Deleted item");
      setTimeout(() => setActionStatus(null), 2000);
    } catch (e) {
      console.error(e);
      setActionStatus("Delete failed");
      setTimeout(() => setActionStatus(null), 2000);
    }
  }

  function handleClearQueue() {
    try {
      const key = "content-studio-sent";
      localStorage.removeItem(key);
      loadQueue();
      setActionStatus("Queue cleared");
      setTimeout(() => setActionStatus(null), 2000);
    } catch (e) {
      console.error(e);
      setActionStatus("Clear failed");
      setTimeout(() => setActionStatus(null), 2000);
    }
  }

  function handleExportQueue() {
    downloadJSON(`content_queue_${Date.now()}.json`, queue);
  }

  return (
    <main className="min-h-screen bg-brand-surface text-slate-100">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="rounded-[2rem] border border-brand-border bg-brand-panel/90 p-8 shadow-panel">
          <h1 className="text-3xl font-semibold text-white">
            Content Personalization Studio
          </h1>
          <p className="text-brand.muted mt-2">
            Generate multilingual, segment-aware communications with compliance
            review and send-to-journey actions.
          </p>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <div className="rounded-3xl border border-brand-border bg-brand-panel/80 p-6">
            <div className="flex flex-wrap gap-2">
              {syntheticLeads.map((l) => (
                <button
                  key={l.id}
                  onClick={() => setLeadId(l.id)}
                  className={`px-3 py-2 rounded-full ${leadId === l.id ? "bg-brand.accent text-slate-950" : "bg-brand-surface text-slate-200"}`}
                >
                  {l.name}
                </button>
              ))}
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <div>
                <label className="text-sm text-slate-400">Channel</label>
                <select
                  value={channel}
                  onChange={(e) => setChannel(e.target.value as Channel)}
                  className="w-full rounded p-2 bg-brand-surface text-white"
                >
                  {channels.map((c) => (
                    <option key={c} value={c}>
                      {c.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm text-slate-400">Language</label>
                <select
                  value={language}
                  onChange={(e) =>
                    setLanguage(e.target.value as LanguageOption)
                  }
                  className="w-full rounded p-2 bg-brand-surface text-white"
                >
                  {languages.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm text-slate-400">Persona</label>
                <select
                  value={persona}
                  onChange={(e) =>
                    setPersona(e.target.value as PersonaCategory)
                  }
                  className="w-full rounded p-2 bg-brand-surface text-white"
                >
                  {personas.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-lg text-white font-semibold">
                Variants & scores
              </h3>
              <p className="text-sm text-slate-400">
                Predicted engagement and conversion relevance (0-100)
              </p>
              <div className="mt-4 space-y-4">
                {result.variants.map((v) => (
                  <div
                    key={v.templateId + v.tone}
                    className="rounded-2xl bg-brand-surface/80 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-slate-400">
                          Tone: {v.tone}
                        </div>
                        <div className="font-semibold text-white mt-1">
                          {v.subject ?? v.body.slice(0, 60) + "..."}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-slate-400">Engagement</div>
                        <div className="font-semibold text-white">
                          {v.engagementScore}
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 text-sm text-slate-300">{v.body}</div>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="text-xs text-slate-400">
                        Relevance: {v.conversionRelevance}
                      </div>
                      <div className="text-xs text-slate-400">
                        Flags: {v.complianceFlags.length}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-lg text-white font-semibold">Compare view</h3>
              <p className="text-sm text-slate-400">
                Generic baseline vs best personalized variant
              </p>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl bg-brand-surface/80 p-4">
                  <div className="text-sm text-slate-400">Generic</div>
                  <div className="font-semibold text-white mt-2">
                    {result.genericVariant.subject ??
                      result.genericVariant.body.slice(0, 60) + "..."}
                  </div>
                  <div className="mt-2 text-sm text-slate-300">
                    {result.genericVariant.body}
                  </div>
                </div>
                <div className="rounded-2xl bg-brand-surface/80 p-4">
                  <div className="text-sm text-slate-400">
                    Personalized (best)
                  </div>
                  <div className="font-semibold text-white mt-2">
                    {bestVariant.subject ??
                      bestVariant.body.slice(0, 60) + "..."}
                  </div>
                  <div className="mt-2 text-sm text-slate-300">
                    {bestVariant.body}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-3">
                <button
                  onClick={handleSendSelected}
                  className="rounded-full px-5 py-2 bg-brand.accent text-slate-950"
                >
                  Send to journey
                </button>
                <button
                  onClick={handleExportAll}
                  className="rounded-full px-5 py-2 border border-brand-border"
                >
                  Export copy
                </button>
                {actionStatus && (
                  <div className="text-sm text-slate-300">{actionStatus}</div>
                )}
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-brand-border bg-brand-panel/80 p-6">
              <h3 className="text-lg font-semibold text-white">
                Compliance review
              </h3>
              <p className="text-sm text-slate-400 mt-2">
                Quick reviewer guidance for flagged variants.
              </p>
              <div className="mt-4 space-y-3">
                {result.variants.map((v) => (
                  <div
                    key={v.templateId + v.tone}
                    className="rounded-2xl bg-brand-surface/70 p-3"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-slate-400">{v.tone}</div>
                        <div className="font-semibold text-white">
                          Eng {v.engagementScore} • Rel {v.conversionRelevance}
                        </div>
                      </div>
                      <div>
                        <CompliancePanel flags={v.complianceFlags} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-brand-border bg-brand-panel/80 p-6">
              <h3 className="text-lg font-semibold text-white">
                Send integration
              </h3>
              <p className="text-sm text-slate-400 mt-2">
                One-click push to orchestrator. (Demo: logs action locally)
              </p>
              <div className="mt-4">
                <button
                  onClick={handleSendSelected}
                  className="rounded-full px-5 py-2 bg-brand.accent text-slate-950"
                >
                  Send selected variant
                </button>
                {actionStatus && (
                  <div className="mt-2 text-sm text-slate-300">
                    {actionStatus}
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-brand-border bg-brand-panel/80 p-6">
              <h3 className="text-lg font-semibold text-white">Local Queue</h3>
              <p className="text-sm text-slate-400 mt-2">
                Queued sends stored locally for demo and replay.
              </p>
              <div className="mt-4 space-y-3">
                {queue.length === 0 && (
                  <div className="text-sm text-slate-400">No queued items</div>
                )}
                {queue.map((it) => (
                  <div
                    key={it.id}
                    className="rounded-lg bg-brand-surface/70 p-3 flex items-start justify-between"
                  >
                    <div className="text-sm">
                      <div className="font-semibold text-white">
                        {it.action}
                      </div>
                      <div className="text-xs text-slate-400">
                        {new Date(it.timestamp).toLocaleString()}
                      </div>
                      <div className="text-xs text-slate-300 mt-2">
                        Lead: {it.payload?.leadId ?? "-"} • Channel:{" "}
                        {it.payload?.channel ?? "-"}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => handleReplayQueueItem(it)}
                        className="px-3 py-1 rounded bg-brand.accent text-slate-950 text-sm"
                      >
                        Replay
                      </button>
                      <button
                        onClick={() => handleDeleteQueueItem(it.id)}
                        className="px-3 py-1 rounded border border-brand-border text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex gap-3">
                <button
                  onClick={handleExportQueue}
                  className="rounded-full px-4 py-2 border border-brand-border text-sm"
                >
                  Export queue
                </button>
                <button
                  onClick={handleClearQueue}
                  className="rounded-full px-4 py-2 bg-rose-600 text-white text-sm"
                >
                  Clear all
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
