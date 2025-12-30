"use client";

import { useState } from "react";

type EventPayload = {
  title: string;
  type: string;
  startAt: string;
  location: string;
  description: string;
  capacity: string;
};

type Props = {
  mode: "create" | "edit";
  eventId?: string;
  initial?: EventPayload;
  status?: "PUBLISHED" | "CANCELED";
};

export default function EventForm({ mode, eventId, initial, status }: Props) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [type, setType] = useState(initial?.type ?? "");
  const [startAt, setStartAt] = useState(initial?.startAt ?? "");
  const [location, setLocation] = useState(initial?.location ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [capacity, setCapacity] = useState(initial?.capacity ?? "");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isCanceled = status === "CANCELED";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (isCanceled) {
      setError("Evenement annule, modification impossible.");
      return;
    }

    setLoading(true);
    const payload = {
      title,
      type: type.trim() ? type.trim() : null,
      startAt: new Date(startAt).toISOString(),
      location,
      description,
      capacity: capacity.trim() ? Number(capacity) : null,
    };

    const response = await fetch(
      mode === "create" ? "/api/admin/events" : `/api/admin/events/${eventId}`,
      {
        method: mode === "create" ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );

    const data = await response.json().catch(() => null);
    if (!response.ok || !data) {
      setError(data?.error ?? "Operation impossible.");
      setLoading(false);
      return;
    }

    setMessage(
      mode === "create"
        ? "Evenement cree. Vous pouvez revenir a la liste."
        : "Evenement mis a jour.",
    );
    setLoading(false);
  }

  return (
    <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block text-sm">
          <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
            Titre
          </span>
          <input
            type="text"
            required
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="w-full rounded-2xl border border-[var(--stroke)] bg-[var(--card)] px-4 py-3 text-base text-[var(--ink)] shadow-sm outline-none transition focus:border-[var(--accent)]"
            placeholder="Rencontre Business Sud"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
            Type (optionnel)
          </span>
          <input
            type="text"
            value={type}
            onChange={(event) => setType(event.target.value)}
            className="w-full rounded-2xl border border-[var(--stroke)] bg-[var(--card)] px-4 py-3 text-base text-[var(--ink)] shadow-sm outline-none transition focus:border-[var(--accent)]"
            placeholder="Networking"
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block text-sm">
          <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
            Date & heure
          </span>
          <input
            type="datetime-local"
            required
            value={startAt}
            onChange={(event) => setStartAt(event.target.value)}
            className="w-full rounded-2xl border border-[var(--stroke)] bg-[var(--card)] px-4 py-3 text-base text-[var(--ink)] shadow-sm outline-none transition focus:border-[var(--accent)]"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
            Lieu
          </span>
          <input
            type="text"
            required
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            className="w-full rounded-2xl border border-[var(--stroke)] bg-[var(--card)] px-4 py-3 text-base text-[var(--ink)] shadow-sm outline-none transition focus:border-[var(--accent)]"
            placeholder="Montpellier"
          />
        </label>
      </div>

      <label className="block text-sm">
        <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
          Description
        </span>
        <textarea
          required
          rows={5}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className="w-full rounded-2xl border border-[var(--stroke)] bg-[var(--card)] px-4 py-3 text-base text-[var(--ink)] shadow-sm outline-none transition focus:border-[var(--accent)]"
          placeholder="Details de la session."
        />
      </label>

      <label className="block text-sm">
        <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
          Capacite (optionnel)
        </span>
        <input
          type="number"
          min={1}
          value={capacity}
          onChange={(event) => setCapacity(event.target.value)}
          className="w-full rounded-2xl border border-[var(--stroke)] bg-[var(--card)] px-4 py-3 text-base text-[var(--ink)] shadow-sm outline-none transition focus:border-[var(--accent)]"
          placeholder="40"
        />
      </label>

      {error && (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {message && (
        <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
          {message}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-2xl bg-[var(--accent)] px-6 py-3 text-xs uppercase tracking-[0.3em] text-white transition hover:bg-[var(--accent-deep)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading
          ? "Enregistrement..."
          : mode === "create"
            ? "Creer l'evenement"
            : "Mettre a jour l'evenement"}
      </button>
    </form>
  );
}
