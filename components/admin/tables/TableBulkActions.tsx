"use client";

import { Download, Printer } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import type { TableView } from "@/types/table";

/** data:image/png;base64,XXXX -> raw base64 payload. */
function base64FromDataUrl(dataUrl: string): string {
  return dataUrl.split(",")[1] ?? "";
}

async function fetchTableQr(tableId: string): Promise<string> {
  const baseUrl = encodeURIComponent(window.location.origin);
  const res = await fetch(`/api/admin/tables/${tableId}/qr?baseUrl=${baseUrl}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Could not generate QR");
  return data.dataUrl as string;
}

function slugify(label: string): string {
  return label.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "table";
}

export function TableBulkActions({ tables }: { tables: TableView[] }) {
  const [isZipping, setIsZipping] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDownloadZip() {
    setIsZipping(true);
    setError(null);
    try {
      const { default: JSZip } = await import("jszip");
      const zip = new JSZip();

      await Promise.all(
        tables.map(async (table) => {
          const dataUrl = await fetchTableQr(table._id);
          zip.file(`${slugify(table.label)}-qr.png`, base64FromDataUrl(dataUrl), { base64: true });
        })
      );

      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "garden-cafe-table-qr-codes.zip";
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not build the ZIP");
    } finally {
      setIsZipping(false);
    }
  }

  async function handlePrintAll() {
    setIsPrinting(true);
    setError(null);
    try {
      const cards = await Promise.all(
        tables.map(async (table) => ({ table, dataUrl: await fetchTableQr(table._id) }))
      );

      const printWindow = window.open("", "_blank", "width=480,height=640");
      if (!printWindow) throw new Error("Pop-up blocked — allow pop-ups to print.");

      const pages = cards
        .map(
          ({ table, dataUrl }) => `
        <div class="card">
          <div class="brand">Garden Cafe</div>
          <h2>${table.label}</h2>
          <img src="${dataUrl}" />
          <p class="cta">SCAN TO VIEW MENU &amp; ORDER</p>
        </div>`
        )
        .join("");

      printWindow.document.write(`
        <html>
          <head>
            <title>Table QR Cards</title>
            <style>
              * { box-sizing: border-box; }
              body { margin: 0; font-family: sans-serif; background: #faf6ec; }
              .card {
                page-break-after: always;
                height: 100vh;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
              }
              .brand { font-family: Georgia, serif; font-weight: bold; font-size: 20px; color: #1e1710; }
              h2 { margin: 4px 0 16px; color: #1e1710; }
              img { width: 260px; height: 260px; }
              .cta { margin-top: 14px; color: #bc4a28; font-weight: 600; letter-spacing: 0.05em; }
            </style>
          </head>
          <body>${pages}</body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not prepare the print job");
    } finally {
      setIsPrinting(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1.5">
      <div className="flex gap-2">
        <Button
          variant="secondary"
          size="sm"
          isLoading={isZipping}
          disabled={tables.length === 0}
          onClick={handleDownloadZip}
        >
          <Download className="h-3.5 w-3.5" strokeWidth={2} />
          Download ZIP
        </Button>
        <Button
          variant="secondary"
          size="sm"
          isLoading={isPrinting}
          disabled={tables.length === 0}
          onClick={handlePrintAll}
        >
          <Printer className="h-3.5 w-3.5" strokeWidth={2} />
          Print all (PDF)
        </Button>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
