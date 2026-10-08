import "server-only";

import { Counter } from "@/lib/db/models/Counter";

function todayKey(): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${yyyy}${mm}${dd}`;
}

/** Atomically allocates the next order number for this restaurant, resetting daily. */
export async function nextOrderNumber(restaurantId: string): Promise<string> {
  const key = `${restaurantId}:${todayKey()}`;

  const counter = await Counter.findOneAndUpdate(
    { key },
    { $inc: { seq: 1 } },
    { upsert: true, new: true }
  );

  const seq = String(counter.seq).padStart(3, "0");
  return `${todayKey()}-${seq}`;
}
