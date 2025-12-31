"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type EventItem = {
  id: string;
  title: string;
  location: string;
  status: "PUBLISHED" | "CANCELED";
  audience: "PUBLIC" | "SELECTED";
  capacity: number | null;
  goingCount: number;
  startAt: string;
  createdByLabel: string;
  createdByUserId: string;
  isInvited: boolean;
  myRsvp: "GOING" | "NOT_GOING" | null;
  canManage: boolean;
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

export default function CommunityEventsList({ events }: Props) {
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

  async function handleRsvp(eventId: string, status: "GOING" | "NOT_GOING") {
    setMessage(null);
    setLoadingId(eventId);
    const response = await fetch(`/api/events/${eventId}/rsvp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      setMessage(data?.error ?? "Action impossible.");
      setLoadingId(null);
      return;
    }
    setCurrentEvents((prev) =>
      prev.map((item) => {
        if (item.id !== eventId) return item;
        const wasGoing = item.myRsvp === "GOING";
        const isGoing = status === "GOING";
        const goingCount = item.goingCount + (isGoing && !wasGoing ? 1 : 0) - (!isGoing && wasGoing ? 1 : 0);
        return { ...item, myRsvp: status, goingCount };
      }),
    );
    setMessage("Inscription mise a jour.");
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
          Aucune activite ne correspond a vos filtres.
        </div>
      )}

      {filteredEvents.map((event) => {
        const remaining = event.capacity ? event.capacity - event.goingCount : null;
        const canJoin =
          event.status === "PUBLISHED" &&
          (event.audience === "PUBLIC" || event.isInvited) &&
          (remaining === null || remaining > 0 || event.myRsvp === "GOING");
        const needsInvite = event.audience === "SELECTED" && !event.isInvited;

        return (
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
                {needsInvite && (
                  <p className="mt-2 text-xs text-[var(--muted)]">
                    Sur invitation du club.
                  </p>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                <span className="rounded-full border border-[var(--stroke)] px-3 py-1">
                  {event.status === "PUBLISHED" ? "Publie" : "Annule"}
                </span>
                <span className="rounded-full border border-[var(--stroke)] px-3 py-1">
                  {event.audience === "PUBLIC" ? "Ouvert" : "Selection"}
                </span>
                {event.capacity && (
                  <span className="rounded-full border border-[var(--stroke)] px-3 py-1">
                    Places: {event.goingCount}/{event.capacity}
                  </span>
                )}
                {remaining !== null && remaining <= 0 && (
                  <span className="rounded-full border border-[var(--stroke)] px-3 py-1 text-red-600">
                    Complet
                  </span>
                )}
              </div>
            </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href={`/community/events/${event.id}`}
              className="rounded-2xl border border-[var(--stroke)] px-4 py-2 text-xs uppercase tracking-[0.2em] text-[var(--muted)] transition hover:border-[var(--accent)]"
            >
              Details
            </Link>
            {event.canManage && (
              <Link
                href={`/community/events/${event.id}/edit`}
                className="rounded-2xl border border-[var(--stroke)] px-4 py-2 text-xs uppercase tracking-[0.2em] text-[var(--muted)] transition hover:border-[var(--accent)]"
              >
                Modifier
              </Link>
            )}
            {canJoin && (
              <>
                  <button
                    type="button"
                    onClick={() => handleRsvp(event.id, "GOING")}
                    disabled={loadingId === event.id}
                    className="rounded-2xl bg-[var(--accent)] px-4 py-2 text-xs uppercase tracking-[0.2em] text-white transition hover:bg-[var(--accent-deep)] disabled:opacity-60"
                  >
                    Je participe
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRsvp(event.id, "NOT_GOING")}
                    disabled={loadingId === event.id}
                    className="rounded-2xl border border-[var(--stroke)] px-4 py-2 text-xs uppercase tracking-[0.2em] text-[var(--muted)] transition hover:border-[var(--accent)] disabled:opacity-60"
                  >
                    Je ne viens pas
                  </button>
                </>
              )}
            </div>
          </div>
        );
      })}
    </section>
  );
}
