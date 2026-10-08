import { cn } from "@/lib/utils";

/** The leaf-sprig mark used throughout the brand kit — a simple three-leaf branch. */
export function LeafMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      className={cn("text-primary", className)}
      aria-hidden="true"
    >
      <path
        d="M24 42V14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M24 28C24 28 14 26 12 16C12 16 24 14 24 28Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M24 20C24 20 34 18 36 8C36 8 24 6 24 20Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M24 36C24 36 16 35 14 28C14 28 24 26 24 36Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface GardenCafeLogoProps {
  /** "dark" for light backgrounds (ink wordmark), "light" for dark sidebars/kitchen screens (cream wordmark). */
  theme?: "dark" | "light";
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: { leaf: "h-6 w-6", title: "text-base", tagline: "text-[10px]" },
  md: { leaf: "h-8 w-8", title: "text-xl", tagline: "text-[11px]" },
  lg: { leaf: "h-11 w-11", title: "text-3xl", tagline: "text-xs" },
};

export function GardenCafeLogo({
  theme = "dark",
  size = "md",
  showTagline = true,
  className,
}: GardenCafeLogoProps) {
  const s = sizeClasses[size];
  const titleColor = theme === "dark" ? "text-ink" : "text-cream";
  const taglineColor = theme === "dark" ? "text-ink/50" : "text-cream/60";

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <LeafMark className={s.leaf} />
      <div className="leading-tight">
        <div className={cn("font-display font-bold tracking-tight", s.title, titleColor)}>
          Garden Cafe
        </div>
        {showTagline && (
          <div className={cn("uppercase tracking-wide", s.tagline, taglineColor)}>
            Good Food · Green Vibes · Better Days
          </div>
        )}
      </div>
    </div>
  );
}
