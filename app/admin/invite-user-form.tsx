"use client";

import { useMemo, useState } from "react";
import { csrfHeaders } from "@/app/components/csrf";

type MemberOption = {
  id: string;
  firstname: string;
  lastname: string;
  company: string;
  email: string | null;
};

type InvitationResult = {
  ok: boolean;
  invitationId: string;
  token: string;
};

type Props = {
  members: MemberOption[];
  canInviteSuperAdmin: boolean;
};

export default function InviteUserForm({ members, canInviteSuperAdmin }: Props) {
  const [email, setEmail] = useState("");
  const [memberId, setMemberId] = useState("");
  const [role, setRole] = useState("USER");
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<InvitationResult | null>(null);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const filteredMembers = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return members;
    return members.filter((member) => {
      const haystack = [
        member.firstname,
        member.lastname,
        member.company,
        member.email ?? "",
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(normalized);
    });
  }, [members, query]);

  const selectedMember = members.find((member) => member.id === memberId);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setResult(null);
    setInviteUrl(null);
    setCopyStatus(null);

    if (!memberId) {
      setError("Selectionnez un membre avant d'envoyer l'invitation.");
      return;
    }

    setLoading(true);

    const response = await fetch("/api/admin/invitations", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...csrfHeaders() },
      body: JSON.stringify({ email, memberId, role }),
    });

    const data = await response.json().catch(() => null);
    if (!response.ok || !data) {
      setError(data?.error ?? "Invitation impossible.");
      setLoading(false);
      return;
    }

    const url = `${window.location.origin}/accept-invite?token=${data.token}`;
    setInviteUrl(url);
    setResult(data);
    setLoading(false);
  }

  async function handleCopyInvite() {
    if (!inviteUrl) return;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopyStatus("Lien copie.");
    } catch {
      setCopyStatus("Copie impossible.");
    }
  }

  return (
    <div className="rounded-2xl border border-[var(--stroke)] bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Inviter un utilisateur</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Generez un lien d&apos;invitation pour permettre a un membre de definir son mot
            de passe et activer son compte.
          </p>
        </div>
        <span className="rounded-full border border-[var(--stroke)] px-3 py-1 text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
          Admin
        </span>
      </div>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <label className="block text-sm">
          <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
            Email d&apos;invitation
          </span>
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-2xl border border-[var(--stroke)] bg-[var(--card)] px-4 py-3 text-base text-[var(--ink)] shadow-sm outline-none transition focus:border-[var(--accent)]"
            placeholder="prenom.nom@domaine.fr"
          />
        </label>

        <div className="grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
          <label className="block text-sm">
            <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
              Rechercher un membre
            </span>
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="w-full rounded-2xl border border-[var(--stroke)] bg-[var(--card)] px-4 py-3 text-base text-[var(--ink)] shadow-sm outline-none transition focus:border-[var(--accent)]"
              placeholder="Nom, entreprise, email"
            />
          </label>

          <label className="block text-sm">
            <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
              Role
            </span>
            <select
              value={role}
              onChange={(event) => setRole(event.target.value)}
              className="w-full rounded-2xl border border-[var(--stroke)] bg-[var(--card)] px-4 py-3 text-base text-[var(--ink)] shadow-sm outline-none transition focus:border-[var(--accent)]"
            >
              <option value="USER">Membre</option>
              <option value="ADMIN">Admin</option>
              {canInviteSuperAdmin && (
                <option value="SUPER_ADMIN">Super Admin</option>
              )}
            </select>
          </label>
        </div>

        <label className="block text-sm">
          <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
            Membre associe
          </span>
          <select
            required
            value={memberId}
            onChange={(event) => setMemberId(event.target.value)}
            className="w-full rounded-2xl border border-[var(--stroke)] bg-[var(--card)] px-4 py-3 text-base text-[var(--ink)] shadow-sm outline-none transition focus:border-[var(--accent)]"
          >
            <option value="">Selectionner un membre</option>
            {filteredMembers.map((member) => (
              <option key={member.id} value={member.id}>
                {member.firstname} {member.lastname} · {member.company}
              </option>
            ))}
          </select>
          <p className="mt-2 text-xs text-[var(--muted)]">
            L&apos;invitation doit etre liee a un membre existant de l&apos;annuaire.
          </p>
        </label>

        {selectedMember && (
          <div className="rounded-2xl border border-[var(--stroke)] bg-[var(--card)] px-4 py-3 text-sm text-[var(--muted)]">
            <p className="text-[var(--ink)]">
              {selectedMember.firstname} {selectedMember.lastname}
            </p>
            <p>
              {selectedMember.company}
              {selectedMember.email ? ` · ${selectedMember.email}` : ""}
            </p>
          </div>
        )}

        {error && (
          <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        {result && inviteUrl && (
          <div className="rounded-2xl border border-[var(--stroke)] bg-[var(--card)] px-4 py-3 text-sm">
            <p className="text-[var(--ink)]">
              Invitation generee. Transmettez ce lien de creation de compte.
            </p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
              <span className="flex-1 break-all rounded-xl border border-[var(--stroke)] bg-white px-3 py-2 text-xs text-[var(--muted)]">
                {inviteUrl}
              </span>
              <button
                type="button"
                onClick={handleCopyInvite}
                className="rounded-2xl bg-[var(--accent)] px-5 py-2 text-xs uppercase tracking-[0.3em] text-white transition hover:bg-[var(--accent-deep)]"
              >
                Copier
              </button>
            </div>
            {copyStatus && (
              <p className="mt-2 text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                {copyStatus}
              </p>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-2xl bg-[var(--accent)] px-6 py-3 text-xs uppercase tracking-[0.3em] text-white transition hover:bg-[var(--accent-deep)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Invitation en cours" : "Generer l'invitation"}
        </button>
      </form>
    </div>
  );
}
