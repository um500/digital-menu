import "server-only";

import QRCode from "qrcode";

import { buildTableUrl } from "./qr-url";

/**
 * Renders the printable QR for one table: the signed URL plus a PNG data URL
 * the admin UI can preview and the browser can print directly (no server
 * file storage needed — it's regenerated on demand from the same HMAC
 * signature stored on the table).
 */
export async function generateTableQr(baseUrl: string, tableId: string, restaurantId: string) {
  const url = buildTableUrl(baseUrl, tableId, restaurantId);
  const dataUrl = await QRCode.toDataURL(url, {
    margin: 1,
    width: 360,
    color: { dark: "#171717", light: "#ffffff" },
  });
  return { url, dataUrl };
}
