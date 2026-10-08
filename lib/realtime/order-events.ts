import type { IOrder } from "@/lib/db/models/Order";
import { publish, subscribe } from "./events";

type OrderEvent =
  | { type: "order.created"; order: IOrder }
  | { type: "order.updated"; order: IOrder };

function channel(restaurantId: string) {
  return `orders:${restaurantId}`;
}

export function publishOrderEvent(restaurantId: string, event: OrderEvent) {
  publish(channel(restaurantId), event);
}

export function subscribeOrderEvents(
  restaurantId: string,
  handler: (event: OrderEvent) => void
) {
  return subscribe(channel(restaurantId), handler);
}
