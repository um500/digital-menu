"use client";

import { Input } from "@/components/ui/input";

export function ReportDateFilter({
  from,
  to,
  onChange,
}: {
  from: string;
  to: string;
  onChange: (from: string, to: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="space-y-1">
        <label htmlFor="report-from" className="text-xs font-medium text-ink/50">
          From
        </label>
        <Input
          id="report-from"
          type="date"
          value={from}
          max={to}
          onChange={(e) => onChange(e.target.value, to)}
          className="w-40"
        />
      </div>
      <div className="space-y-1">
        <label htmlFor="report-to" className="text-xs font-medium text-ink/50">
          To
        </label>
        <Input
          id="report-to"
          type="date"
          value={to}
          min={from}
          max={new Date().toISOString().slice(0, 10)}
          onChange={(e) => onChange(from, e.target.value)}
          className="w-40"
        />
      </div>
    </div>
  );
}
