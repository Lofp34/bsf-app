"use client";

import { useMemo, useState } from "react";

type User = {
  id: string;
  authEmail: string;
  role: string;
  isActive: boolean;
  member: { firstname: string; lastname: string; company: string } | null;
};

type FilterKey = "all" | "active" | "inactive";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "Tous" },
  { key: "active", label: "Actifs" },
  { key: "inactive", label: "Inactifs" },
];

type Props = {
  users: User[];
};

export default function UsersList({ users }: Props) {
  const [currentUsers, setCurrentUsers] = useState(users);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const filteredUsers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return currentUsers.filter((user) => {
      const matchesQuery = normalizedQuery
        ? [
            user.authEmail,
            user.member?.firstname ?? "",
            user.member?.lastname ?? "",
            user.member?.company ?? "",
          ]
            .join(" ")
            .toLowerCase()
            .includes(normalizedQuery)
        : true;
      const matchesFilter =
        filter === "all"
          ? true
          : filter === "active"
            ? user.isActive
            : !user.isActive;
      return matchesQuery && matchesFilter;
    });
  }, [currentUsers, query, filter]);

  async function updateStatus(userId: string, action: "deactivate" | "activate") {
    setMessage(null);
    if (action === "deactivate") {
      const confirmed = window.confirm(
        "Confirmer la desactivation de cet utilisateur ?",
      );
      if (!confirmed) return;
    }
    setLoadingId(userId);

    const response = await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });

    if (!response.ok) {
      setMessage("Action impossible. Rechargez la page.");
      setLoadingId(null);
      return;
    }

    setCurrentUsers((prev) =>
      prev.map((item) =>
        item.id === userId
          ? { ...item, isActive: action === "activate" }
          : item,
      ),
    );
    setMessage("Statut mis a jour.");
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
            placeholder="Email, membre, entreprise"
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

      {filteredUsers.length === 0 && (
        <div className="rounded-2xl border border-dashed border-[var(--stroke)] bg-white px-5 py-6 text-sm text-[var(--muted)]">
          Aucun utilisateur ne correspond a vos filtres.
        </div>
      )}

      {filteredUsers.map((user) => (
        <div
          key={user.id}
          className="rounded-2xl border border-[var(--stroke)] bg-white px-5 py-5 shadow-sm"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-lg font-semibold text-[var(--ink)]">
                {user.authEmail}
              </p>
              <p className="text-sm text-[var(--muted)]">
                {user.member
                  ? `${user.member.firstname} ${user.member.lastname} · ${user.member.company}`
                  : "Profil membre non lie"}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
              <span className="rounded-full border border-[var(--stroke)] px-3 py-1">
                Role: {user.role}
              </span>
              <span
                className={`rounded-full border border-[var(--stroke)] px-3 py-1 ${
                  user.isActive ? "text-emerald-700" : "text-red-600"
                }`}
              >
                {user.isActive ? "Actif" : "Inactif"}
              </span>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {user.isActive ? (
              <button
                type="button"
                onClick={() => updateStatus(user.id, "deactivate")}
                disabled={loadingId === user.id}
                className="rounded-2xl border border-[var(--stroke)] px-4 py-2 text-xs uppercase tracking-[0.2em] text-[var(--muted)] transition hover:border-[var(--accent)] disabled:opacity-60"
              >
                {loadingId === user.id ? "Desactivation..." : "Desactiver"}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => updateStatus(user.id, "activate")}
                disabled={loadingId === user.id}
                className="rounded-2xl border border-[var(--stroke)] px-4 py-2 text-xs uppercase tracking-[0.2em] text-[var(--muted)] transition hover:border-[var(--accent)] disabled:opacity-60"
              >
                {loadingId === user.id ? "Activation..." : "Activer"}
              </button>
            )}
          </div>
        </div>
      ))}
    </section>
  );
}
