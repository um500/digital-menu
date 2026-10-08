import { type InputHTMLAttributes, forwardRef } from "react";

import { cn } from "@/lib/utils";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "h-10 w-full rounded-lg border border-border bg-white px-3 text-sm text-ink",
          "placeholder:text-ink/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-light",
          "disabled:cursor-not-allowed disabled:bg-cream-soft",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";
