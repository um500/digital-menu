import { signTable } from "./generate-qr";

/** Builds the full URL that gets printed as a QR code on a physical table card. */
export function buildTableUrl(baseUrl: string, tableId: string, restaurantId: string): string {
  const sig = signTable(tableId, restaurantId);
  const url = new URL(`/table/${tableId}`, baseUrl);
  url.searchParams.set("r", restaurantId);
  url.searchParams.set("sig", sig);
  return url.toString();
}
