"use client";

import { Delete } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { useActiveStaff } from "@/hooks/use-active-staff";
import { cn } from "@/lib/utils";

const MAX_PIN_LENGTH = 6;
const KEYPAD_DIGITS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "⌫"];

/**
 * A small "who's using this device" badge for shared tablets (kitchen,
 * counter). Shows a PIN prompt when no one is clocked in, and "Clocked in
 * as X" with a Switch button once someone is. This never gates access to
 * the page itself — the admin session already does that — it only
 * attributes actions to a staff member.
 */
export function StaffPinGate() {
  const { staff, isLoaded, clockIn, clockOut } = useActiveStaff();
  const [isPrompting, setIsPrompting] = useState(false);
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  if (!isLoaded) return null;

  async function handleSubmit() {
    if (pin.length < 4) return;
    setIsVerifying(true);
    setError(null);
    try {
      const res = await fetch("/api/staff/verify-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "PIN not recognized");
      clockIn(data.staff);
      setIsPrompting(false);
      setPin("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "PIN not recognized");
    } finally {
      setIsVerifying(false);
    }
  }

  function handleKeyPress(digit: string) {
    if (error) setError(null);
    if (digit === "⌫") {
      setPin((p) => p.slice(0, -1));
    } else if (digit && pin.length < MAX_PIN_LENGTH) {
      setPin((p) => p + digit);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsPrompting(true)}
        className="flex items-center gap-1.5 rounded-full border border-border bg-white px-3 py-1 text-xs font-medium text-ink/70 hover:bg-cream-soft"
      >
        {staff ? (
          <>
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            Clocked in as {staff.name}
          </>
        ) : (
          "Clock in"
        )}
      </button>

      <Modal
        open={isPrompting}
        onClose={() => {
          setIsPrompting(false);
          setPin("");
          setError(null);
        }}
      >
        {staff && (
          <div className="mb-4 flex items-center justify-between rounded-lg bg-cream-soft p-3">
            <span className="text-sm text-ink/70">
              Currently: <span className="font-medium">{staff.name}</span>
            </span>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => {
                clockOut();
                setIsPrompting(false);
              }}
            >
              Clock out
            </Button>
          </div>
        )}

        <div className="flex flex-col items-center gap-5">
          <h2 className="font-display text-lg font-semibold text-ink">
            {staff ? "Switch staff member" : "Enter your PIN"}
          </h2>

          <div className="flex gap-2.5">
            {Array.from({ length: Math.max(pin.length, 4) }, (_, i) => (
              <span
                key={i}
                className={cn(
                  "h-3 w-3 rounded-full border-2",
                  i < pin.length ? "border-primary bg-primary" : "border-border"
                )}
              />
            ))}
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="grid grid-cols-3 gap-3">
            {KEYPAD_DIGITS.map((digit, i) =>
              digit === "" ? (
                <span key={i} />
              ) : (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleKeyPress(digit)}
                  className="flex h-14 w-14 items-center justify-center rounded-full bg-cream-soft text-lg font-medium text-ink transition-colors hover:bg-primary-light active:bg-primary-light"
                >
                  {digit === "⌫" ? <Delete className="h-5 w-5" strokeWidth={2} /> : digit}
                </button>
              )
            )}
          </div>

          <div className="flex w-full justify-end gap-2 pt-1">
            <Button type="button" variant="secondary" onClick={() => setIsPrompting(false)}>
              Cancel
            </Button>
            <Button type="button" disabled={pin.length < 4} isLoading={isVerifying} onClick={handleSubmit}>
              Clock in
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
