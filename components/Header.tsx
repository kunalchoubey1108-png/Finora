"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useBank } from "./BankContext";
import BankSwitcher from "./BankSwitcher";

export function Header() {
  const { activeBank } = useBank();
  const pathname = usePathname();

  if (pathname === "/showcase") {
    return null;
  }

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition">
          <span className="font-display text-2xl font-normal tracking-[-0.04em] text-[#17191c]">
            {activeBank.fullName}
          </span>
          <span className="text-xs font-normal text-[#979799]">
            Enterprise Agentic Acquisition
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/showcase" className="text-sm text-[#777b86] transition hover:text-[#17191c] hover:underline">
            Generic showcase →
          </Link>
          <Link
            href="/call-center"
            className="text-sm text-[#17191c] transition hover:underline"
          >
            Call Center →
          </Link>
          <BankSwitcher />
        </div>
      </div>
    </header>
  );
}

export default Header;
