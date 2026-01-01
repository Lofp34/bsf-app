"use client";

import { useState } from "react";
import { csrfHeaders } from "@/app/components/csrf";

type Props = {
  eventId: string;
  canManage: boolean;
  status: "PUBLISHED" | "CANCELED";
};

export default function EventActions({ eventId, canManage, status }: Props) {
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleCancel() {
    if (!canManage || status === "CANCELED") return;
    const confirmed = window.confirm("Confirmer l'annulation de l'activite ?");
    if (!confirmed) return;
    setLoading(true);
    setMessage(null);

    const response = await fetch(`/api/events/${eventId}/cancel`, {
      method: "POST",
      headers: { ...csrfHeaders() },
    });

    if (!response.ok) {
      setMessage("Annulation impossible. Rechargez la page.");
      setLoading(false);
      return;
    }

    setMessage("Activite annulee. Rechargez la page.");
    setLoading(false);
  }

  return (
    <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
      {canManage && status === "PUBLISHED" && (
        <button
          type="button"
          onClick={handleCancel}
          disabled={loading}
          className="rounded-2xl border border-[var(--stroke)] px-4 py-2 text-xs uppercase tracking-[0.2em] text-[var(--muted)] transition hover:border-[var(--accent)] disabled:opacity-60"
        >
          {loading ? "Annulation..." : "Annuler l'activite"}
        </button>
      )}
      {message && (
        <span className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
          {message}
        </span>
      )}
    </div>
  );
}
