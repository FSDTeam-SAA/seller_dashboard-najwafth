import { cn, getStatusTone } from "@/lib/utils";

const toneClasses: Record<string, string> = {
  default: "bg-slate-100 text-slate-700",
  success: "bg-emerald-100 text-emerald-700",
  warning: "bg-amber-100 text-amber-700",
  danger: "bg-rose-100 text-rose-700",
};

export function Badge({
  children,
  tone,
  className,
}: {
  children: React.ReactNode;
  tone?: string;
  className?: string;
}) {
  const resolvedTone = tone || "default";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold capitalize",
        toneClasses[resolvedTone || getStatusTone(String(children))],
        className,
      )}
    >
      {children}
    </span>
  );
}
