import type { ReactNode } from "react";

export function Badge({
  children,
  variant = "default",
}: {
  children: ReactNode;
  variant?: "default" | "success" | "warning" | "danger";
}) {
  const colors = {
    default: "bg-brand-surface text-brand.highlight border-brand-border",
    success: "bg-emerald-500/10 text-emerald-200 border-emerald-500/20",
    warning: "bg-amber-500/10 text-amber-200 border-amber-500/20",
    danger: "bg-rose-500/10 text-rose-200 border-rose-500/20",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-sm font-medium ${colors[variant]}`}
    >
      {children}
    </span>
  );
}
