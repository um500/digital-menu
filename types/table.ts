export type TableStatus = "empty" | "occupied" | "reserved";

export interface TableView {
  _id: string;
  restaurantId: string;
  label: string;
  capacity: number;
  status: TableStatus;
  activeOrderId?: string | null;
}
