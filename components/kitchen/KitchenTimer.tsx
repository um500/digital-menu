"use client";

import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";

function elapsedMinutes(since: string): number {
  return Math.floor((Date.now() - new Date(since).getTime()) / 60000);
}

export function KitchenTimer({ placedAt }: { placedAt: string }) {
  const [minutes, setMinutes] = useState(() => elapsedMinutes(placedAt));

  useEffect(() => {
    const id = setInterval(() => setMinutes(elapsedMinutes(placedAt)), 15000);
    return () => clearInterval(id);
  }, [placedAt]);

  const tone = minutes >= 15 ? "danger" : minutes >= 8 ? "warning" : "neutral";

  return <Badge tone={tone}>{minutes}m</Badge>;
}
