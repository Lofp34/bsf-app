"use client";

import { useState } from "react";

type RecommendationItem = {
  id: string;
  status: "SENT" | "IN_PROGRESS" | "VALIDATED" | "ABANDONED";
  recipientLabel: string;
  text: string;
};

type Props = {
  items: RecommendationItem[];
};

const STATUS_OPTIONS = [
  { value: "SENT", label: "Envoyee" },
  { value: "IN_PROGRESS", label: "En cours" },
  { value: "VALIDATED", label: "Validee" },
  { value: "ABANDONED", label: "Abandonnee" },
];

export default function SentList({ items }: Props) {
  const [message, setMessage] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [revenues, setRevenues] = useState<Record<string, string>>({});

  async function handleUpdate(id: string, status: string) {
    setMessage(null);
    setLoadingId(id);
    const revenueAmount = revenues[id] ? Number(revenues[id]) : null;

    const response = await fetch(`/api/recommendations/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status,
        revenueAmount: status === "VALIDATED" ? revenueAmount : null,
        revenueCurrency: "EUR",
      }),
    });

    if (!response.ok) {
      setMessage("Mise a jour impossible.");
      setLoadingId(null);
      return;
    }

    setMessage("Statut mis a jour.");
    setLoadingId(null);
  }

  return (
    <section className="rounded-2xl border border-[var(--stroke)] bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold">Mes recommandations envoyees</h2>
      {message && (
        <div className="mt-4 rounded-xl border border-[var(--stroke)] bg-[var(--card)] px-4 py-2 text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
          {message}
        </div>
      )}
      <div className="mt-4 space-y-3 text-sm text-[var(--muted)]">
        {items.length === 0 && (
          <p className="rounded-xl border border-dashed border-[var(--stroke)] bg-[var(--card)] px-4 py-3">
            Aucune recommandation envoyee.
          </p>
        )}
        {items.map((rec) => (
          <div
            key={rec.id}
            className="rounded-xl border border-[var(--stroke)] bg-[var(--card)] px-4 py-3"
          >
            <p className="text-sm font-semibold text-[var(--ink)]">
              Vers {rec.recipientLabel}
            </p>
            <p className="mt-1 text-xs text-[var(--muted)]">
              Statut actuel: {rec.status}
            </p>
            <p className="mt-2 text-xs text-[var(--muted)]">{rec.text}</p>
            <div className="mt-3 grid gap-2 md:grid-cols-[1fr_140px_140px]">
              <select
                defaultValue={rec.status}
                onChange={(event) => handleUpdate(rec.id, event.target.value)}
                className="w-full rounded-2xl border border-[var(--stroke)] bg-white px-3 py-2 text-xs uppercase tracking-[0.2em] text-[var(--muted)]"
                disabled={loadingId === rec.id}
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min={0}
                value={revenues[rec.id] ?? ""}
                onChange={(event) =>
                  setRevenues((prev) => ({ ...prev, [rec.id]: event.target.value }))
                }
                placeholder="Montant"
                className="w-full rounded-2xl border border-[var(--stroke)] bg-white px-3 py-2 text-sm text-[var(--muted)]"
              />
              <span className="rounded-2xl border border-[var(--stroke)] bg-white px-3 py-2 text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                EUR
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
