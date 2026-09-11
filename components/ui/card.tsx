import type { ReactNode } from "react";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-3xl border border-brand-border bg-brand-panel/90 p-6 shadow-panel backdrop-blur-xl ${className}`}
    >
      {children}
    </div>
  );
}
