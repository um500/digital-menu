import { redirect } from "next/navigation";

// No table context (not scanned from a QR) → demo mode drops straight into
// the menu as a takeaway/counter order. A real table visit goes through
// /table/[tableId] instead, which this redirect never touches.
export default function RootPage() {
  redirect("/menu");
}
