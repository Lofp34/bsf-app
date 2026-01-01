"use client";

import { useMemo, useState } from "react";
import { csrfHeaders } from "@/app/components/csrf";

type MemberOption = {
  id: string;
  firstname: string;
  lastname: string;
  company: string;
};

type Props = {
  members: MemberOption[];
  mode?: "create" | "edit";
  eventId?: string;
  initial?: {
    title: string;
    type: string;
    startAt: string;
    location: string;
    description: string;
    capacity: string;
  };
};

export default function CommunityEventForm({
  members,
  mode = "create",
  eventId,
  initial,
}: Props) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [type, setType] = useState(initial?.type ?? "");
  const [startAt, setStartAt] = useState(initial?.startAt ?? "");
  const [location, setLocation] = useState(initial?.location ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [capacity, setCapacity] = useState(initial?.capacity ?? "");
  const [audience, setAudience] = useState<"PUBLIC" | "SELECTED">("PUBLIC");
  const [inviteAll, setInviteAll] = useState(true);
  const [inviteQuery, setInviteQuery] = useState("");
  const [selectedInvites, setSelectedInvites] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filteredMembers = useMemo(() => {
    const normalized = inviteQuery.trim().toLowerCase();
    if (!normalized) return members;
    return members.filter((member) =>
      `${member.firstname} ${member.lastname} ${member.company}`
        .toLowerCase()
        .includes(normalized),
    );
  }, [members, inviteQuery]);

  function toggleInvite(memberId: string) {
    setSelectedInvites((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId],
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);
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
      mode === "create" ? "/api/events" : `/api/events/${eventId}`,
      {
        method: mode === "create" ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json", ...csrfHeaders() },
        body: JSON.stringify(
          mode === "create"
            ? {
                ...payload,
                audience: inviteAll ? "PUBLIC" : audience,
                inviteAll,
                inviteMemberIds: inviteAll ? [] : selectedInvites,
              }
            : payload,
        ),
      },
    );

    const data = await response.json().catch(() => null);
    if (!response.ok || !data) {
      setError(data?.error ?? "Creation impossible.");
      setLoading(false);
      return;
    }

    setMessage(
      mode === "create"
        ? "Activite creee. Vous pouvez revenir a la liste."
        : "Activite mise a jour.",
    );
    if (mode === "create") {
      setTitle("");
      setType("");
      setStartAt("");
      setLocation("");
      setDescription("");
      setCapacity("");
      setAudience("PUBLIC");
      setInviteAll(true);
      setSelectedInvites([]);
    }
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
        />
      </label>

      {mode === "create" && (
        <div className="rounded-2xl border border-[var(--stroke)] bg-[var(--card)] px-4 py-4">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
            Invitations
          </p>
          <div className="mt-3 flex flex-wrap gap-4 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="invite-mode"
                checked={inviteAll}
                onChange={() => {
                  setInviteAll(true);
                  setAudience("PUBLIC");
                }}
                className="h-4 w-4 accent-[var(--accent)]"
              />
              Tout le monde
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="invite-mode"
                checked={!inviteAll}
                onChange={() => {
                  setInviteAll(false);
                  setAudience("SELECTED");
                }}
                className="h-4 w-4 accent-[var(--accent)]"
              />
              Selectionner des membres
            </label>
          </div>

          {!inviteAll && (
            <div className="mt-4 space-y-3">
              <input
                type="text"
                value={inviteQuery}
                onChange={(event) => setInviteQuery(event.target.value)}
                placeholder="Rechercher un membre"
                className="w-full rounded-2xl border border-[var(--stroke)] bg-white px-4 py-2 text-sm text-[var(--ink)] shadow-sm outline-none transition focus:border-[var(--accent)]"
              />
              <div className="max-h-52 overflow-auto rounded-2xl border border-[var(--stroke)] bg-white p-3 text-sm">
                {filteredMembers.map((member) => (
                  <label key={member.id} className="flex items-center gap-3 py-1">
                    <input
                      type="checkbox"
                      checked={selectedInvites.includes(member.id)}
                      onChange={() => toggleInvite(member.id)}
                      className="h-4 w-4 accent-[var(--accent)]"
                    />
                    <span>
                      {member.firstname} {member.lastname} · {member.company}
                    </span>
                  </label>
                ))}
              </div>
              <p className="text-xs text-[var(--muted)]">
                Selectionnes: {selectedInvites.length}
              </p>
            </div>
          )}
        </div>
      )}

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
            ? "Creer l'activite"
            : "Mettre a jour"}
      </button>
    </form>
  );
}
