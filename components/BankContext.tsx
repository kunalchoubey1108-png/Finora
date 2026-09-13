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
    if (typeof window === "undefined") {
      return bankRegistry.default;
    }

    const savedBankId = window.localStorage.getItem("active-bank-id");
    return getBankConfig(savedBankId ?? "default");
  });

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-theme", activeBank.theme);
    }

    if (typeof window !== "undefined") {
      window.localStorage.setItem("active-bank-id", activeBank.id);
    }
  }, [activeBank]);

  const setBank = (bankId: string) => {
    if (bankRegistry[bankId]) {
      setActiveBank(bankRegistry[bankId]);
      return;
    }

    setActiveBank(bankRegistry.default);
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
