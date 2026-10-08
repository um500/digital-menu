import { GardenCafeLogo } from "@/components/shared/GardenCafeLogo";
import { StaffPinGate } from "@/components/shared/StaffPinGate";

export function KitchenHeader({
  isConnected,
  openTicketCount,
}: {
  isConnected: boolean;
  openTicketCount: number;
}) {
  return (
    <header className="flex items-center justify-between border-b border-white/10 bg-ink-sidebar px-4 py-3">
      <div className="flex items-center gap-3">
        <GardenCafeLogo theme="light" size="sm" showTagline={false} />
        <span className="flex items-center gap-1.5 rounded-full bg-primary px-2.5 py-0.5 text-xs font-semibold text-white">
          {openTicketCount} open
        </span>
      </div>
      <div className="flex items-center gap-3">
        <StaffPinGate />
        <span className="flex items-center gap-1.5 text-xs text-cream/50">
          <span className={`h-2 w-2 rounded-full ${isConnected ? "bg-accent" : "bg-cream/20"}`} />
          {isConnected ? "Live" : "Reconnecting..."}
        </span>
      </div>
    </header>
  );
}
