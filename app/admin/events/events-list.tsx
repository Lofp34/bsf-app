"use client";

import { useMemo, useState } from "react";
import { csrfHeaders } from "@/app/components/csrf";
import Link from "next/link";

type EventItem = {
  id: string;
  title: string;
  location: string;
  status: "PUBLISHED" | "CANCELED";
  capacity: number | null;
  startAt: string;
  createdByLabel: string;
};

type FilterKey = "all" | "published" | "canceled";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "Tous" },
  { key: "published", label: "Publies" },
  { key: "canceled", label: "Annules" },
];

type Props = {
  events: EventItem[];
};

export default function EventsList({ events }: Props) {
  const [currentEvents, setCurrentEvents] = useState(events);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const filteredEvents = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return currentEvents.filter((event) => {
      const matchesQuery = normalizedQuery
        ? [event.title, event.location, event.createdByLabel]
            .join(" ")
            .toLowerCase()
            .includes(normalizedQuery)
        : true;
      const matchesFilter =
        filter === "all"
          ? true
          : filter === "published"
            ? event.status === "PUBLISHED"
            : event.status === "CANCELED";
      return matchesQuery && matchesFilter;
    });
  }, [currentEvents, query, filter]);

  const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  async function handleCancel(eventId: string) {
    setMessage(null);
    const confirmed = window.confirm("Confirmer l'annulation de l'evenement ?");
    if (!confirmed) return;
    setLoadingId(eventId);
    const response = await fetch(`/api/admin/events/${eventId}/cancel`, {
      method: "POST",
      headers: { ...csrfHeaders() },
    });
    if (!response.ok) {
      setMessage("Annulation impossible. Rechargez la page.");
      setLoadingId(null);
      return;
    }
    setCurrentEvents((prev) =>
      prev.map((item) =>
        item.id === eventId ? { ...item, status: "CANCELED" } : item,
      ),
    );
    setMessage("Evenement annule.");
    setLoadingId(null);
  }

  return (
    <section className="mt-6 space-y-4">
      <div className="flex flex-col gap-4 rounded-2xl border border-[var(--stroke)] bg-white p-4 md:flex-row md:items-center md:justify-between">
        <div className="flex-1">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
            Recherche
          </p>
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Titre, lieu, organisateur"
            className="mt-2 w-full rounded-2xl border border-[var(--stroke)] bg-[var(--card)] px-4 py-2 text-sm text-[var(--ink)] shadow-sm outline-none transition focus:border-[var(--accent)]"
          />
          <p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">
            Filtre applique sur la page courante.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setFilter(item.key)}
              className={`rounded-full border px-3 py-2 text-xs uppercase tracking-[0.2em] ${
                filter === item.key
                  ? "border-[var(--accent)] bg-[var(--card)] text-[var(--ink)]"
                  : "border-[var(--stroke)] bg-white text-[var(--muted)]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {message && (
        <div className="rounded-2xl border border-[var(--stroke)] bg-[var(--card)] px-4 py-3 text-sm text-[var(--muted)]">
          {message}
        </div>
      )}

      {filteredEvents.length === 0 && (
        <div className="rounded-2xl border border-dashed border-[var(--stroke)] bg-white px-5 py-6 text-sm text-[var(--muted)]">
          Aucun evenement ne correspond a vos filtres.
        </div>
      )}

      {filteredEvents.map((event) => (
        <div
          key={event.id}
          className="rounded-2xl border border-[var(--stroke)] bg-white px-5 py-5 shadow-sm"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-lg font-semibold text-[var(--ink)]">
                {event.title}
              </p>
              <p className="text-sm text-[var(--muted)]">
                {dateFormatter.format(new Date(event.startAt))} · {event.location}
              </p>
              <p className="mt-2 text-xs text-[var(--muted)]">
                Cree par {event.createdByLabel}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
              <span className="rounded-full border border-[var(--stroke)] px-3 py-1">
                {event.status === "PUBLISHED" ? "Publie" : "Annule"}
              </span>
              {event.capacity && (
                <span className="rounded-full border border-[var(--stroke)] px-3 py-1">
                  Cap: {event.capacity}
                </span>
              )}
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href={`/admin/events/${event.id}`}
              className="rounded-2xl border border-[var(--stroke)] px-4 py-2 text-xs uppercase tracking-[0.2em] text-[var(--muted)] transition hover:border-[var(--accent)]"
            >
              Modifier
            </Link>
            {event.status === "PUBLISHED" && (
              <button
                type="button"
                onClick={() => handleCancel(event.id)}
                disabled={loadingId === event.id}
                className="rounded-2xl border border-[var(--stroke)] px-4 py-2 text-xs uppercase tracking-[0.2em] text-[var(--muted)] transition hover:border-[var(--accent)] disabled:opacity-60"
              >
                {loadingId === event.id ? "Annulation..." : "Annuler"}
              </button>
            )}
          </div>
        </div>
      ))}
    </section>
  );
}
