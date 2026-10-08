"use client";

import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import type { StaffRole, StaffView } from "@/types/staff";

const roleLabels: Record<StaffRole, string> = {
  waiter: "Waiter",
  kitchen: "Kitchen",
  cashier: "Cashier",
};

interface StaffCardProps {
  staff: StaffView;
  onEdit: () => void;
  onDeleted: () => void;
}

export function StaffCard({ staff, onEdit, onDeleted }: StaffCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    if (!window.confirm(`Remove "${staff.name}"? This can't be undone.`)) return;
    setIsDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/staff/${staff._id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not remove staff member");
      onDeleted();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not remove staff member");
      setIsDeleting(false);
    }
  }

  return (
    <Card>
      <CardBody className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-ink">{staff.name}</span>
          <Badge tone={staff.isActive ? "success" : "neutral"}>
            {staff.isActive ? "Active" : "Inactive"}
          </Badge>
        </div>
        <p className="text-sm text-ink/50">{roleLabels[staff.role]}</p>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex flex-wrap gap-2 pt-1">
          <Button variant="secondary" size="sm" onClick={onEdit}>
            Edit
          </Button>
          <Button variant="danger" size="sm" isLoading={isDeleting} onClick={handleDelete}>
            Remove
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}
