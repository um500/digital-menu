import { redirect } from "next/navigation";

// The bare domain is where an admin lands to manage the restaurant — not a
// customer entry point. Customers only ever reach the menu through a table's
// QR code (/table/[tableId]) or a link an admin hands them; this root route
// never touches those. proxy.ts sends anyone without a valid admin session
// from here on to /admin/login automatically.
export default function RootPage() {
  redirect("/admin/live-orders");
}
