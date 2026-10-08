export type StaffRole = "waiter" | "kitchen" | "cashier";

export interface StaffView {
  _id: string;
  name: string;
  role: StaffRole;
  isActive: boolean;
}
