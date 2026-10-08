import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

export function Loading({ label = "Loading...", className }: { label?: string; className?: string }) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-3 py-16 text-ink/50", className)}>
      <Spinner />
      <p className="text-sm">{label}</p>
    </div>
  );
}
