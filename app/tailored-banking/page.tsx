"use client";

import { FormEvent, useState } from "react";

type RequestState = "idle" | "sending" | "sent" | "error";

export default function TailoredBankingPage() {
  const [status, setStatus] = useState<RequestState>("idle");
  const [reference, setReference] = useState("");

  async function submitRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    const form = new FormData(event.currentTarget);
    const request = Object.fromEntries(form.entries());

    try {
      const response = await fetch("/api/tailored-bank-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setReference(result.reference);
      setStatus("sent");
      event.currentTarget.reset();
    } catch {
      setStatus("error");
    }
  }

  return (
    <main className="editorial-page">
      <div className="editorial-container py-12 md:py-20">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <section className="lg:sticky lg:top-28">
            <p className="editorial-eyebrow">Tailored deployment</p>
            <h1 className="editorial-section-title mt-4 max-w-lg">
              Make the platform <em>yours.</em>
            </h1>
            <p className="editorial-subhead mt-5">
              Share your institution’s context and a proposed development budget. Our team will use it to scope a tailored, governance-ready version of the platform.
            </p>
            <div className="editorial-peach mt-8 p-6">
              <p className="text-sm font-medium">What your request includes</p>
              <ul className="mt-4 space-y-3 text-sm leading-6">
                <li>Bank-specific product, policy and workflow configuration</li>
                <li>Regional onboarding and compliance requirements</li>
                <li>A non-binding development bid for your proposed scope</li>
              </ul>
            </div>
          </section>

          <section className="editorial-card p-6 md:p-8">
            {status === "sent" ? (
              <div className="editorial-artifact p-8 text-center">
                <p className="editorial-eyebrow">Request received</p>
                <h2 className="font-display mt-3 text-4xl tracking-[-0.03em]">Thank you.</h2>
                <p className="mx-auto mt-4 max-w-md text-[#777b86]">
                  Your tailored-deployment request has been routed to the developer team. Reference: {reference}
                </p>
                <button onClick={() => setStatus("idle")} className="editorial-pill editorial-pill--ghost mt-7">
                  Submit another request
                </button>
              </div>
            ) : (
              <form onSubmit={submitRequest} className="space-y-7">
                <div>
                  <p className="editorial-eyebrow">Your institution</p>
                  <h2 className="font-display mt-2 text-3xl tracking-[-0.03em]">Tell us about your bank.</h2>
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Bank name" name="bankName" required />
                  <Field label="Head office location" name="location" placeholder="City, country" required />
                  <Field label="Your name" name="contactName" required />
                  <Field label="Work email" name="email" type="email" required />
                  <Field label="Website" name="website" type="url" placeholder="https://" />
                  <Field label="Institution size" name="size" placeholder="e.g. 2M customers" />
                  <Field label="Proposed development bid (₹)" name="bid" type="number" min="0" placeholder="0" required />
                  <label className="block text-sm text-[#17191c]">
                    Preferred delivery window
                    <select name="timeline" defaultValue="" className="mt-2 w-full rounded-2xl border border-[#ececec] bg-white px-4 py-3 text-[#17191c] outline-none focus:border-[#17191c]">
                      <option value="" disabled>Select a window</option>
                      <option>Within 3 months</option>
                      <option>3–6 months</option>
                      <option>6–12 months</option>
                      <option>Exploratory</option>
                    </select>
                  </label>
                </div>
                <label className="block text-sm text-[#17191c]">
                  What should be tailored?
                  <textarea name="requirements" required rows={5} placeholder="Products, regions, compliance controls, integrations, languages…" className="mt-2 w-full resize-y rounded-2xl border border-[#ececec] bg-white px-4 py-3 text-[#17191c] outline-none placeholder:text-[#a3a6af] focus:border-[#17191c]" />
                </label>
                <div className="flex flex-wrap items-center gap-4">
                  <button disabled={status === "sending"} className="editorial-pill editorial-pill--filled disabled:cursor-wait disabled:opacity-60">
                    {status === "sending" ? "Routing request…" : "Send request to developers"}
                  </button>
                  <p className="text-sm text-[#777b86]">Your bid is treated as non-binding until scoped together.</p>
                </div>
                {status === "error" && <p className="text-sm text-[#5d2a1a]">We couldn’t submit the request. Please try again.</p>}
              </form>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

function Field({ label, name, type = "text", required, placeholder, min }: { label: string; name: string; type?: string; required?: boolean; placeholder?: string; min?: string }) {
  return (
    <label className="block text-sm text-[#17191c]">
      {label}
      <input name={name} type={type} required={required} placeholder={placeholder} min={min} className="mt-2 w-full rounded-2xl border border-[#ececec] bg-white px-4 py-3 text-[#17191c] outline-none placeholder:text-[#a3a6af] focus:border-[#17191c]" />
    </label>
  );
}
