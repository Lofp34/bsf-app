"use client";

import { useMemo, useState } from "react";
import { csrfHeaders } from "@/app/components/csrf";

type Invitation = {
  id: string;
  email: string;
  role: string;
  sentAt: string;
  expireAt: string;
  acceptedAt: string | null;
  member: { firstname: string; lastname: string; company: string } | null;
};

type FilterKey = "all" | "pending" | "accepted" | "expired";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "Toutes" },
  { key: "pending", label: "En attente" },
  { key: "accepted", label: "Acceptees" },
  { key: "expired", label: "Expirees" },
];

type Props = {
  invitations: Invitation[];
};

export default function InvitationsList({ invitations }: Props) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [actionId, setActionId] = useState<string | null>(null);
  const [inviteLink, setInviteLink] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const now = useMemo(() => new Date(), []);

  const filteredInvitations = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return invitations.filter((invite) => {
      const status =
        invite.acceptedAt !== null
          ? "accepted"
          : new Date(invite.expireAt) < now
            ? "expired"
            : "pending";

      const matchesFilter = filter === "all" ? true : filter === status;
      const matchesQuery = normalizedQuery
        ? [
            invite.email,
            invite.member?.firstname ?? "",
            invite.member?.lastname ?? "",
            invite.member?.company ?? "",
          ]
            .join(" ")
            .toLowerCase()
            .includes(normalizedQuery)
        : true;
      return matchesFilter && matchesQuery;
    });
  }, [invitations, filter, now, query]);

  async function handleResend(invitationId: string) {
    setError(null);
    setActionId(invitationId);
    setInviteLink((prev) => ({ ...prev, [invitationId]: "" }));

    const response = await fetch(`/api/admin/invitations/${invitationId}/resend`, {
      method: "POST",
      headers: { ...csrfHeaders() },
    });

    const data = await response.json().catch(() => null);
    if (!response.ok || !data) {
      setError("Impossible de regenerer le lien.");
      setActionId(null);
      return;
    }

    const link = `${window.location.origin}/accept-invite?token=${data.token}`;
    setInviteLink((prev) => ({ ...prev, [invitationId]: link }));
    setCopiedId(null);
    setActionId(null);
  }

  async function handleCopy(invitationId: string) {
    const link = inviteLink[invitationId];
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      setCopiedId(invitationId);
    } catch {
      setError("Copie impossible.");
    }
  }

  const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
  });

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

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {filteredInvitations.length === 0 && (
        <div className="rounded-2xl border border-dashed border-[var(--stroke)] bg-white px-5 py-6 text-sm text-[var(--muted)]">
          Aucune invitation ne correspond a vos filtres.
        </div>
      )}

      {filteredInvitations.map((invitation) => {
        const isExpired =
          invitation.acceptedAt === null && new Date(invitation.expireAt) < now;
        const statusLabel =
          invitation.acceptedAt !== null
            ? "Acceptee"
            : isExpired
              ? "Expiree"
              : "En attente";
        const statusTone =
          invitation.acceptedAt !== null
            ? "text-emerald-700"
            : isExpired
              ? "text-red-600"
              : "text-[var(--accent)]";
        const link = inviteLink[invitation.id];

        return (
          <div
            key={invitation.id}
            className="rounded-2xl border border-[var(--stroke)] bg-white px-5 py-5 shadow-sm"
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-lg font-semibold text-[var(--ink)]">
                  {invitation.email}
                </p>
                <p className="text-sm text-[var(--muted)]">
                  Envoyee le {dateFormatter.format(new Date(invitation.sentAt))}
                </p>
                <p className="mt-2 text-xs text-[var(--muted)]">
                  {invitation.member
                    ? `${invitation.member.firstname} ${invitation.member.lastname} · ${invitation.member.company}`
                    : "Membre non lie"}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.2em]">
                <span
                  className={`rounded-full border border-[var(--stroke)] px-3 py-1 ${statusTone}`}
                >
                  {statusLabel}
                </span>
                <span className="rounded-full border border-[var(--stroke)] px-3 py-1 text-[var(--muted)]">
                  Role: {invitation.role}
                </span>
              </div>
            </div>

            {invitation.acceptedAt === null && (
              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={() => handleResend(invitation.id)}
                  disabled={actionId === invitation.id}
                  className="rounded-2xl border border-[var(--stroke)] px-4 py-2 text-xs uppercase tracking-[0.2em] text-[var(--muted)] transition hover:border-[var(--accent)] disabled:opacity-60"
                >
                  {actionId === invitation.id ? "Generation..." : "Regenerer le lien"}
                </button>
                {link && (
                  <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
                    <span className="flex-1 break-all rounded-xl border border-[var(--stroke)] bg-[var(--card)] px-3 py-2 text-xs text-[var(--muted)]">
                      {link}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(invitation.id)}
                      className="rounded-2xl bg-[var(--accent)] px-4 py-2 text-xs uppercase tracking-[0.2em] text-white transition hover:bg-[var(--accent-deep)]"
                    >
                      {copiedId === invitation.id ? "Copie" : "Copier"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </section>
  );
}
