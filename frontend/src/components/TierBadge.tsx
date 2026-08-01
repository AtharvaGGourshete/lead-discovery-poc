import type { Tier } from "../types";

const tierClasses: Record<Tier, string> = {
  A: "tier-badge tier-badge--a",
  B: "tier-badge tier-badge--b",
  C: "tier-badge tier-badge--c"
};

export function TierBadge({ tier }: { tier: Tier }) {
  return <span className={tierClasses[tier]}>Tier {tier}</span>;
}
