"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useBank } from "./BankContext";
import { bankRegistry } from "../lib/bankRegistry";

export function BankSwitcher() {
  const { activeBank, setBank } = useBank();
  const [isOpen, setIsOpen] = useState(false);

  const bankOptions = Object.values(bankRegistry);

  return (
    <div className="relative z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 rounded-full border border-brand-border bg-white px-4 py-2 text-sm font-medium text-[#17191c] transition hover:border-[#17191c]"
      >
        <span className="flex h-2.5 w-2.5 rounded-full bg-brand-accent animate-pulse" />
        <span className="font-medium text-[#17191c]">
          Active Brand:
        </span>
        <span>{activeBank.fullName}</span>
        <svg
          className={`h-4 w-4 text-brand-muted transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 z-50 mt-2 w-72 origin-top-right rounded-2xl border border-brand-border bg-white p-2 shadow-[0_8px_40px_rgba(0,0,0,0.1)]">
            <p className="px-3 py-2 text-xs font-medium uppercase tracking-wider text-[#777b86]">
              Select Acquiring Institution
            </p>
            <div className="mt-1 space-y-1">
              {bankOptions.map((bank) => (
                <button
                  key={bank.id}
                  onClick={() => {
                    setBank(bank.id);
                    setIsOpen(false);
                    // Force refresh details if needed, page updates will happen through reactivity
                    if (typeof window !== "undefined") {
                      // Dispatch custom event to trigger reloading flow data in page component
                      window.dispatchEvent(new CustomEvent("bank-changed", { detail: bank.id }));
                    }
                  }}
                  className={`w-full text-left rounded-xl px-4 py-3 transition ${
                    activeBank.id === bank.id
                      ? "bg-[#17191c] text-white font-medium"
                      : "text-[#17191c] hover:bg-[#f2f2f3]"
                  }`}
                >
                  <div className="text-sm">{bank.fullName}</div>
                  <div
                    className={`text-xs mt-0.5 ${
                      activeBank.id === bank.id
                        ? "text-white/70"
                        : "text-[#777b86]"
                    }`}
                  >
                    {bank.tagline}
                  </div>
                </button>
              ))}
            </div>
            <div className="mt-2 border-t border-brand-border pt-2">
              <Link
                href="/tailored-banking"
                onClick={() => setIsOpen(false)}
                className="block rounded-xl px-4 py-3 text-sm text-[#17191c] transition hover:bg-[#fbe1d1]"
              >
                <span className="block font-medium">Other Bank</span>
                <span className="mt-0.5 block text-xs text-[#777b86]">Request a tailored deployment →</span>
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default BankSwitcher;
