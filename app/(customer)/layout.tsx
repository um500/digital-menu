import type { ReactNode } from "react";

export default function CustomerLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-cream pb-24">{children}</div>;
}
