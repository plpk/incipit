import { cn } from "@/lib/utils";
import type { ConfidenceLevel } from "@/lib/types";

const LABEL: Record<ConfidenceLevel, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
  unable: "N/A",
};

const STYLE: Record<ConfidenceLevel, string> = {
  high: "confidence-high",
  medium: "confidence-medium",
  low: "confidence-low",
  unable: "confidence-unable",
};

export function ConfidenceBadge({
  level,
  className,
}: {
  level: ConfidenceLevel;
  className?: string;
}) {
  return (
    <span className={cn("confidence-badge", STYLE[level], className)}>
      {LABEL[level]}
    </span>
  );
}

export function TrustTierBadge({ tier }: { tier: "T1" | "T2" | "T3" }) {
  const map = {
    T1: { label: "✓ Verified", cls: "pill-verified" },
    T2: { label: "Unconfirmed", cls: "pill-unconfirmed" },
    T3: { label: "Flagged", cls: "pill-flagged" },
  } as const;
  const v = map[tier];
  return <span className={v.cls}>{v.label}</span>;
}
