"use client";

import { useState } from "react";

import { AdminShell } from "@/components/admin/AdminShell";
import { StaffCard } from "@/components/admin/staff/StaffCard";
import { StaffFormModal } from "@/components/admin/staff/StaffFormModal";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/shared/ErrorState";
import { Loading } from "@/components/shared/Loading";
import { useStaff } from "@/hooks/use-staff";
import type { StaffView } from "@/types/staff";

export default function StaffPage() {
  const { staff, isLoading, error, mutate } = useStaff();
  const [editing, setEditing] = useState<StaffView | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  return (
    <AdminShell title="Staff">
      <div className="p-4">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-ink/50">
            {staff.length} staff member{staff.length === 1 ? "" : "s"}
          </p>
          <Button size="sm" onClick={() => setIsAdding(true)}>
            + Add staff
          </Button>
        </div>

        <p className="mb-4 text-xs text-ink/50">
          Staff PINs let the kitchen and counter tablets attribute actions to a person. They
          don&apos;t replace this admin login, which still protects the device itself.
        </p>

        {isLoading && <Loading label="Loading staff..." />}
        {error && <ErrorState message="Could not load staff." onRetry={() => mutate()} />}

        {!isLoading && !error && staff.length === 0 && (
          <p className="py-16 text-center text-sm text-ink/50">
            No staff members yet. Add one to get started.
          </p>
        )}

        {!isLoading && !error && staff.length > 0 && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {staff.map((member) => (
              <StaffCard
                key={member._id}
                staff={member}
                onEdit={() => setEditing(member)}
                onDeleted={() => mutate()}
              />
            ))}
          </div>
        )}
      </div>

      <StaffFormModal
        key={isAdding ? "add-open" : "add-closed"}
        open={isAdding}
        onClose={() => setIsAdding(false)}
        onSaved={() => mutate()}
      />
      <StaffFormModal
        key={editing ? `edit-${editing._id}` : "edit-closed"}
        open={!!editing}
        staff={editing}
        onClose={() => setEditing(null)}
        onSaved={() => mutate()}
      />
    </AdminShell>
  );
}
