"use client";

import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Spinner } from "@/components/ui/spinner";
import { GardenCafeLogo } from "@/components/shared/GardenCafeLogo";
import { useTableQr } from "@/hooks/use-table-qr";
import type { TableView } from "@/types/table";

export function TableQrModal({
  table,
  onClose,
}: {
  table: TableView | null;
  onClose: () => void;
}) {
  const { dataUrl, error } = useTableQr(table?._id);

  function handlePrint() {
    const printWindow = window.open("", "_blank", "width=420,height=560");
    if (!printWindow || !dataUrl || !table) return;
    printWindow.document.write(`
      <html>
        <head><title>${table.label} — QR</title></head>
        <body style="margin:0;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;font-family:Georgia,serif;background:#faf6ec;">
          <div style="font-weight:bold;font-size:20px;color:#1e1710;">Garden Cafe</div>
          <h2 style="margin:4px 0 16px;color:#1e1710;font-family:sans-serif;">${table.label}</h2>
          <img src="${dataUrl}" style="width:260px;height:260px;" />
          <p style="margin-top:14px;color:#bc4a28;font-family:sans-serif;font-weight:600;letter-spacing:0.05em;">SCAN TO VIEW MENU &amp; ORDER</p>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  }

  return (
    <Modal open={!!table} onClose={onClose}>
      <div className="flex flex-col items-center gap-4 text-center">
        <GardenCafeLogo size="sm" showTagline={false} />
        <h2 className="font-display text-lg font-semibold text-ink">{table?.label}</h2>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {!error && !dataUrl && <Spinner />}
        {dataUrl && (
          // eslint-disable-next-line @next/next/no-img-element -- a data: URL, not an optimizable remote image
          <img
            src={dataUrl}
            alt={`QR code for ${table?.label}`}
            className="h-64 w-64 rounded-xl border border-border p-2"
          />
        )}

        <p className="text-sm font-medium uppercase tracking-wide text-primary">
          Scan to view menu &amp; order
        </p>

        <div className="flex gap-2">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          <Button onClick={handlePrint} disabled={!dataUrl}>
            Print
          </Button>
        </div>
      </div>
    </Modal>
  );
}
