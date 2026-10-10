import type { IOrder } from "@/lib/db/models/Order";
import type { ITable } from "@/lib/db/models/Table";
import { publish, subscribe } from "./events";

type OrderEvent =
  | { type: "order.created"; order: IOrder }
  | { type: "order.updated"; order: IOrder }
  // A table-level waiter call — raised before any order exists, so it
  // can't ride on an order.* event. Same admin channel/stream as the rest:
  // one SSE connection, one toast feed, regardless of which kind it is.
  | { type: "table.waiterCall"; table: ITable };

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
