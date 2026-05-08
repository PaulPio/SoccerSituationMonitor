import type { SignalSeverity, SourceTier } from "@/lib/soccer/types";

const severityClass: Record<SignalSeverity, string> = {
  Noise: "border-[#6e7681] bg-[#6e7681]/10 text-[#8b949e]",
  Monitor: "border-[#2ea67f] bg-[#2ea67f]/10 text-[#2ea67f]",
  Move: "border-[#d29922] bg-[#d29922]/10 text-[#d29922]",
  Shock: "border-[#f85149] bg-[#f85149]/10 text-[#f85149]",
};

const severityDot: Record<SignalSeverity, string> = {
  Noise: "bg-[#6e7681]",
  Monitor: "bg-[#2ea67f]",
  Move: "bg-[#d29922]",
  Shock: "bg-[#f85149]",
};

export function SeverityBadge({ severity }: { severity: SignalSeverity }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${severityClass[severity]}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${severityDot[severity]}`} />
      {severity}
    </span>
  );
}

export function SourceTierBadge({ tier }: { tier: SourceTier }) {
  return (
    <span className="rounded-full border border-[#30363d] bg-[#21262d] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#8b949e]">
      {tier}
    </span>
  );
}