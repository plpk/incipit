import { cn } from "@/lib/utils";
import type { ConfidenceLevel } from "@/lib/types";

const LABEL: Record<ConfidenceLevel, string> = {
  high: "High confidence",
  medium: "Medium",
  low: "Low",
  unable: "Unable to read",
};

const STYLE: Record<ConfidenceLevel, string> = {
  high: "bg-emerald-50 text-emerald-800 border border-emerald-200",
  medium: "bg-amber-50 text-amber-800 border border-amber-200",
  low: "bg-rose-50 text-rose-800 border border-rose-200",
  unable: "bg-ink-100 text-ink-500 border border-ink-200",
};

export function ConfidenceBadge({
  level,
  className,
}: {
  level: ConfidenceLevel;
  className?: string;
}) {
  return (
    <span className={cn("chip", STYLE[level], className)}>{LABEL[level]}</span>
  );
}

export function TrustTierBadge({ tier }: { tier: "T1" | "T2" | "T3" }) {
  const map = {
    T1: { label: "Verified", cls: "bg-emerald-50 text-emerald-800 border border-emerald-200" },
    T2: { label: "Unconfirmed", cls: "bg-parchment-100 text-ink-600 border border-parchment-300" },
    T3: { label: "Flagged", cls: "bg-rose-50 text-rose-800 border border-rose-200" },
  } as const;
  const v = map[tier];
  return <span className={cn("chip", v.cls)}>{v.label}</span>;
}
