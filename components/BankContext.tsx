"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { BankConfig, getBankConfig, bankRegistry } from "../lib/bankRegistry";

interface BankContextType {
  activeBank: BankConfig;
  setBank: (bankId: string) => void;
}

const BankContext = createContext<BankContextType | undefined>(undefined);

export function BankProvider({ children }: { children: React.ReactNode }) {
  const [activeBank, setActiveBank] = useState<BankConfig>(() => {
    // Default fallback
    return bankRegistry.sbi;
  });

  useEffect(() => {
    // Load from localStorage on client side
    const saved = localStorage.getItem("active-bank-id");
    if (saved && bankRegistry[saved]) {
      setActiveBank(bankRegistry[saved]);
    }
  }, []);

  useEffect(() => {
    // Apply dataset attribute to document root
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-theme", activeBank.theme);
    }
  }, [activeBank]);

  const setBank = (bankId: string) => {
    if (bankRegistry[bankId]) {
      setActiveBank(bankRegistry[bankId]);
      localStorage.setItem("active-bank-id", bankId);
    }
  };

  return (
    <BankContext.Provider value={{ activeBank, setBank }}>
      {children}
    </BankContext.Provider>
  );
}

export function useBank() {
  const context = useContext(BankContext);
  if (!context) {
    throw new Error("useBank must be used within a BankProvider");
  }
  return context;
}
