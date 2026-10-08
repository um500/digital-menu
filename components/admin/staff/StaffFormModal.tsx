"use client";

import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Switch } from "@/components/ui/switch";
import type { StaffRole, StaffView } from "@/types/staff";

interface StaffFormModalProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  /** Present when editing an existing staff member; absent when creating one. */
  staff?: StaffView | null;
}

export function StaffFormModal({ open, onClose, onSaved, staff }: StaffFormModalProps) {
  const [name, setName] = useState(staff?.name ?? "");
  const [role, setRole] = useState<StaffRole>(staff?.role ?? "waiter");
  const [pin, setPin] = useState("");
  const [isActive, setIsActive] = useState(staff?.isActive ?? true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      const url = staff ? `/api/admin/staff/${staff._id}` : "/api/admin/staff";
      const method = staff ? "PATCH" : "POST";
      const body: Record<string, unknown> = { name, role };
      if (!staff) {
        body.pin = pin;
      } else {
        body.isActive = isActive;
        if (pin) body.pin = pin;
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not save staff member");
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save staff member");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <h2 className="text-lg font-semibold text-ink">
          {staff ? "Edit staff member" : "Add staff member"}
        </h2>

        <div className="space-y-1.5">
          <label htmlFor="name" className="text-sm font-medium text-ink/70">
            Name
          </label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Ramesh"
            required
            maxLength={60}
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="role" className="text-sm font-medium text-ink/70">
            Role
          </label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value as StaffRole)}
            className="h-10 w-full rounded-lg border border-border bg-white px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-light"
          >
            <option value="waiter">Waiter</option>
            <option value="kitchen">Kitchen</option>
            <option value="cashier">Cashier</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="pin" className="text-sm font-medium text-ink/70">
            {staff ? "New PIN (leave blank to keep current)" : "PIN (4-6 digits)"}
          </label>
          <Input
            id="pin"
            inputMode="numeric"
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
            placeholder="e.g. 1234"
            minLength={4}
            maxLength={6}
            required={!staff}
          />
        </div>

        {staff && (
          <Switch
            checked={isActive}
            onChange={setIsActive}
            label="Active"
            description="Turn off to stop this PIN from working without deleting the staff record"
          />
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSaving}>
            {staff ? "Save changes" : "Add staff member"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
