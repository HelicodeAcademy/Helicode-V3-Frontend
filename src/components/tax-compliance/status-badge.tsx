import { cn } from "@/lib/utils";

type Tone = "critical" | "warning" | "success" | "info" | "neutral";

const toneClasses: Record<Tone, string> = {
  critical: "bg-red-500/10 text-red-400 border-red-500/20",
  warning: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  success: "bg-green-500/10 text-green-400 border-green-500/20",
  info: "bg-sky-500/10 text-sky-400 border-sky-500/20",
  neutral: "bg-muted text-muted-foreground border-transparent",
};

const statusToneMap: Record<string, Tone> = {
  Overdue: "critical",
  "Due today": "warning",
  Filed: "success",
  Scheduled: "neutral",
  Approved: "success",
  "Pending approval": "warning",
  Generated: "success",
  Pending: "warning",
  Failed: "critical",
  Active: "success",
  Updated: "info",
  Inactive: "neutral",
};

export function StatusPill({
  label,
  tone,
  className,
}: {
  label: string;
  tone?: Tone;
  className?: string;
}) {
  const resolvedTone = tone ?? statusToneMap[label] ?? "neutral";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        toneClasses[resolvedTone],
        className,
      )}
    >
      {label}
    </span>
  );
}

export function severityToTone(
  severity: "critical" | "warning" | "info",
): Tone {
  return severity;
}

export function stageToTone(stage: "live" | "in-build" | "planned"): Tone {
  if (stage === "live") return "success";
  if (stage === "in-build") return "info";
  return "neutral";
}

export function stageLabel(stage: "live" | "in-build" | "planned"): string {
  if (stage === "live") return "Live";
  if (stage === "in-build") return "In build";
  return "Planned";
}
