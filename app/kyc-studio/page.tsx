"use client";

import React, { useEffect, useState } from "react";
import type { OnboardingResult, LeadProfile } from "../../lib/types";

const SAMPLE_LEAD: LeadProfile = {
  id: "lead_kyc_demo_1",
  name: `{bank} Smart Savings + Lifestyle Credit Card`,
  city: "Mumbai",
  age: 34,
  income: 62000,
  digitalAffinity: 78,
  preferredLanguage: "English",
  persona: {
    title: "{bank} Salary Plus Account + Starter Credit Card",
    archetype: "Urban Professional",
    motivation: "Convenience",
  },
  previousProducts: ["Savings"],
  segment: "Urban Growth",
  challengeSummary: "New to digital credit",
  riskSignals: [],
  governanceFlags: [],
  regulatoryNotes: "",
  score: {
    conversionProbability: 72,
    productFit: 68,
    onboardingConfidence: 84,
    confidence: 75,
    businessValue: 98000,
    complianceRisk: 38,
    decisionGrade: "B",
  },
};

export default function KYCStudioPage() {
  const [step, setStep] = useState(0);
  const [lead] = useState<LeadProfile>(SAMPLE_LEAD);
  const [result, setResult] = useState<OnboardingResult | null>(null);
  const [ocrOk, setOcrOk] = useState(true);
  const [faceOk, setFaceOk] = useState(true);
  const [livenessOk, setLivenessOk] = useState(true);
  const [exceptionQueue, setExceptionQueue] = useState<any[]>([]);
  const [selectedException, setSelectedException] = useState<number | null>(
    null,
  );
  const [reviewNote, setReviewNote] = useState("");

  useEffect(() => {
    const raw = localStorage.getItem("kyc-exception-queue");
    if (raw) setExceptionQueue(JSON.parse(raw));
  }, []);

  useEffect(() => {
    localStorage.setItem("kyc-exception-queue", JSON.stringify(exceptionQueue));
  }, [exceptionQueue]);

  async function submitAssessment() {
    const body = { lead };
    const res = await fetch("/api/kyc/assess", {
      method: "POST",
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (data?.ok) {
      setResult(data.result);
      if (
        data.result.status === "Exception Routed" ||
        data.result.status === "Manual Review" ||
        data.result.status === "Spoof Risk"
      ) {
        setExceptionQueue((q) => [
          ...q,
          {
            id: data.result.sessionId || `${lead.id}_${Date.now()}`,
            lead,
            result: data.result,
          },
        ]);
      }
    } else {
      alert("Assessment failed: " + (data?.error || "unknown"));
    }
  }

  async function submitReview(itemIndex: number, decision: string) {
    const item = exceptionQueue[itemIndex];
    const body = {
      sessionId: item.id || item.result.sessionId,
      decision,
      reviewer: "demo.reviewer@bankdemo.com",
      notes: reviewNote,
    };
    const res = await fetch("/api/kyc/review", {
      method: "POST",
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (data?.ok) {
      /* Default Theme */
      setExceptionQueue((q) => q.filter((_, i) => i !== itemIndex));
      setSelectedException(null);
      setReviewNote("");
      alert("Reviewer action recorded.");
    } else {
      alert("Review failed: " + (data?.error || "unknown"));
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">
        KYC Studio — Merchant Current Account + QR Onboarding
      </h1>

      <div className="mb-6">
        <div className="flex gap-2 mb-2">
          <button className="px-3 py-1 border" onClick={() => setStep(0)}>
            Consent
          </button>
          <button className="px-3 py-1 border" onClick={() => setStep(1)}>
            Document
          </button>
          <button className="px-3 py-1 border" onClick={() => setStep(2)}>
            Face Match
          </button>
          <button className="px-3 py-1 border" onClick={() => setStep(3)}>
            Liveness
          </button>
          <button className="px-3 py-1 border" onClick={() => setStep(4)}>
            Summary
          </button>
        </div>

        <div className="p-4 border rounded">
          {step === 0 && (
            <div>
              <p>
                Consent: Capture user consent for video recording and
                processing.
              </p>
              <button
                onClick={() => setStep(1)}
                className="mt-3 px-3 py-1 bg-sky-500 text-white"
              >
                // Challenge alignment with bank solutions
              </button>
            </div>
          )}

          {step === 1 && (
            <div>
              <p>
                Document capture (simulated). Toggle OCR success to affect
                routing.
              </p>
              <label className="block mt-2">
                <input
                  type="checkbox"
                  checked={ocrOk}
                  onChange={(e) => setOcrOk(e.target.checked)}
                />{" "}
                OCR OK
              </label>
              <button
                onClick={() => setStep(2)}
                className="mt-3 px-3 py-1 bg-sky-500 text-white"
              >
                Next: Face Match
              </button>
            </div>
          )}

          {step === 2 && (
            <div>
              <p>Face match (simulated). Toggle face match quality.</p>
              <label className="block mt-2">
                <input
                  type="checkbox"
                  checked={faceOk}
                  onChange={(e) => setFaceOk(e.target.checked)}
                />{" "}
                Face Match OK
              </label>
              <button
                onClick={() => setStep(3)}
                className="mt-3 px-3 py-1 bg-sky-500 text-white"
              >
                Next: Liveness
              </button>
            </div>
          )}

          {step === 3 && (
            <div>
              <p>Liveness (simulated). Toggle liveness quality.</p>
              <label className="block mt-2">
                <input
                  type="checkbox"
                  checked={livenessOk}
                  onChange={(e) => setLivenessOk(e.target.checked)}
                />{" "}
                Liveness OK
              </label>
              <button
                onClick={() => setStep(4)}
                className="mt-3 px-3 py-1 bg-sky-500 text-white"
              >
                Next: Summary
              </button>
            </div>
          )}

          {step === 4 && (
            <div>
              <p>
                rationale: "Fit with bank's product suite and segment offerings",
              </p>
              <ul className="list-disc ml-6">
                <li>OCR: {ocrOk ? "Good" : "Low confidence"}</li>
                <li>Face Match: {faceOk ? "Good" : "Potential mismatch"}</li>
                <li>Liveness: {livenessOk ? "Good" : "Weak"}</li>
              </ul>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={async () => {
                    // tweak lead signals to simulate
                    const simulated = { ...lead };
                    simulated.riskSignals = [];
                    if (!ocrOk) simulated.riskSignals.push("OCR low");
                    if (!faceOk) simulated.riskSignals.push("Face mismatch");
                    if (!livenessOk)
                      simulated.riskSignals.push("Unstable network");
                    // call assessment
                    const res = await fetch("/api/kyc/assess", {
                      method: "POST",
                      body: JSON.stringify({ lead: simulated }),
                    });
                    const data = await res.json();
                    if (data?.ok) {
                      setResult(data.result);
                      if (
                        [
                          "Exception Routed",
                          "Manual Review",
                          "Spoof Risk",
                        ].includes(data.result.status)
                      ) {
                        setExceptionQueue((q) => [
                          ...q,
                          {
                            id:
                              data.result.sessionId ||
                              `${lead.id}_${Date.now()}`,
                            lead: simulated,
                            result: data.result,
                          },
                        ]);
                      }
                    } else {
                      alert("Assessment failed");
                    }
                  }}
                  className="px-3 py-1 bg-green-600 text-white"
                >
                  Submit Assessment
                </button>
                <button onClick={() => setStep(0)} className="px-3 py-1 border">
                  Restart
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6" data-theme="default">
        <div className="p-4 border rounded">
          <h2 className="font-semibold mb-2">Assessment Result</h2>
          {result ? (
            <div>
              <p>
                <strong>Status:</strong> {result.status}
              </p>
              <p className="mt-2">
                <strong>Details:</strong> {result.verificationDetails}
              </p>
              <div className="mt-2">
                <h3 className="font-medium">Audit Trail</h3>
                <ol className="list-decimal ml-6">
                  {result.auditTrail.map((a) => (
                    <li key={a.id} className="mb-1">
                      <strong>{a.step}</strong>: {a.decision} — {a.rationale}{" "}
                      <span className="text-xs text-gray-500">
                        ({a.timestamp})
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          ) : (
            <p>No assessment run yet.</p>
          )}
        </div>

        <div className="p-4 border rounded">
          <h2 className="font-semibold mb-2">
            Exception Queue & Reviewer Panel
          </h2>
          <div className="mb-3">
            <h3 className="font-medium">Queue ({exceptionQueue.length})</h3>
            <ul className="list-disc ml-6">
              {exceptionQueue.map((item, idx) => (
                <li key={item.id} className="mb-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <div>
                        <strong>{item.lead.name}</strong> — {item.result.status}
                      </div>
                      <div className="text-sm text-gray-600">
                        {item.result.mismatchReason ||
                          item.result.exceptionFlags?.join(", ")}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedException(idx)}
                        className="px-2 py-1 border"
                      >
                        Open
                      </button>
                      <button
                        onClick={() =>
                          setExceptionQueue((q) =>
                            q.filter((_, i) => i !== idx),
                          )
                        }
                        className="px-2 py-1 border"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {selectedException !== null && exceptionQueue[selectedException] && (
            <div className="mt-2 p-2 border rounded bg-gray-50">
              <h4 className="font-medium">
                Reviewer: {exceptionQueue[selectedException].lead.name}
              </h4>
              <p className="text-sm">
                Session: {exceptionQueue[selectedException].result.sessionId}
              </p>
              <textarea
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                placeholder="Review notes"
                className="w-full p-2 border mt-2"
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => submitReview(selectedException, "approved")}
                  className="px-3 py-1 bg-green-600 text-white"
                >
                  Approve
                </button>
                <button
                  onClick={() => submitReview(selectedException, "exonerated")}
                  className="px-3 py-1 bg-yellow-500 text-white"
                >
                  Exonerate
                </button>
                <button
                  onClick={() => submitReview(selectedException, "rejected")}
                  className="px-3 py-1 bg-red-600 text-white"
                >
                  Reject
                </button>
                <button
                  onClick={() => setSelectedException(null)}
                  className="px-3 py-1 border"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
