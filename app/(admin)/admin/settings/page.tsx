"use client";

import { AdminShell } from "@/components/admin/AdminShell";
import { SettingsForm } from "@/components/admin/settings/SettingsForm";
import { ErrorState } from "@/components/shared/ErrorState";
import { Loading } from "@/components/shared/Loading";
import { useSettings } from "@/hooks/use-settings";

export default function SettingsPage() {
  const { settings, isLoading, error, mutate } = useSettings();

  return (
    <AdminShell title="Settings">
      <div className="mx-auto max-w-3xl p-4">
        {isLoading && <Loading label="Loading settings..." />}
        {error && <ErrorState message="Could not load settings." onRetry={() => mutate()} />}
        {settings && <SettingsForm key={settings._id} settings={settings} onSaved={() => mutate()} />}
      </div>
    </AdminShell>
  );
}
