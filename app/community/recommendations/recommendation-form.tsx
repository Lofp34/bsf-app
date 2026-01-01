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
};

export default function RecommendationForm({ members }: Props) {
  const [recipientMemberId, setRecipientMemberId] = useState("");
  const [query, setQuery] = useState("");
  const [recContactFirstname, setRecContactFirstname] = useState("");
  const [recContactLastname, setRecContactLastname] = useState("");
  const [recContactCompany, setRecContactCompany] = useState("");
  const [recContactEmail, setRecContactEmail] = useState("");
  const [recContactPhone, setRecContactPhone] = useState("");
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filteredMembers = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return members;
    return members.filter((member) =>
      `${member.firstname} ${member.lastname} ${member.company}`
        .toLowerCase()
        .includes(normalized),
    );
  }, [members, query]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    const response = await fetch("/api/recommendations", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...csrfHeaders() },
      body: JSON.stringify({
        recipientMemberId,
        recContactFirstname,
        recContactLastname,
        recContactCompany: recContactCompany || null,
        recContactEmail: recContactEmail || null,
        recContactPhone: recContactPhone || null,
        text,
      }),
    });

    const data = await response.json().catch(() => null);
    if (!response.ok || !data) {
      setError(data?.error ?? "Creation impossible.");
      setLoading(false);
      return;
    }

    setMessage("Recommandation envoyee.");
    setRecipientMemberId("");
    setQuery("");
    setRecContactFirstname("");
    setRecContactLastname("");
    setRecContactCompany("");
    setRecContactEmail("");
    setRecContactPhone("");
    setText("");
    setLoading(false);
  }

  return (
    <div className="rounded-2xl border border-[var(--stroke)] bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold">Nouvelle recommandation</h2>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Indiquez le membre receveur et le contact recommande.
      </p>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
              Recherche membre
            </span>
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="w-full rounded-2xl border border-[var(--stroke)] bg-[var(--card)] px-4 py-3 text-base text-[var(--ink)] shadow-sm outline-none transition focus:border-[var(--accent)]"
              placeholder="Nom, entreprise"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
              Membre receveur
            </span>
            <select
              required
              value={recipientMemberId}
              onChange={(event) => setRecipientMemberId(event.target.value)}
              className="w-full rounded-2xl border border-[var(--stroke)] bg-[var(--card)] px-4 py-3 text-base text-[var(--ink)] shadow-sm outline-none transition focus:border-[var(--accent)]"
            >
              <option value="">Selectionner</option>
              {filteredMembers.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.firstname} {member.lastname} · {member.company}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
              Prenom contact
            </span>
            <input
              type="text"
              required
              value={recContactFirstname}
              onChange={(event) => setRecContactFirstname(event.target.value)}
              className="w-full rounded-2xl border border-[var(--stroke)] bg-[var(--card)] px-4 py-3 text-base text-[var(--ink)] shadow-sm outline-none transition focus:border-[var(--accent)]"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
              Nom contact
            </span>
            <input
              type="text"
              required
              value={recContactLastname}
              onChange={(event) => setRecContactLastname(event.target.value)}
              className="w-full rounded-2xl border border-[var(--stroke)] bg-[var(--card)] px-4 py-3 text-base text-[var(--ink)] shadow-sm outline-none transition focus:border-[var(--accent)]"
            />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
              Societe (optionnel)
            </span>
            <input
              type="text"
              value={recContactCompany}
              onChange={(event) => setRecContactCompany(event.target.value)}
              className="w-full rounded-2xl border border-[var(--stroke)] bg-[var(--card)] px-4 py-3 text-base text-[var(--ink)] shadow-sm outline-none transition focus:border-[var(--accent)]"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
              Email (optionnel)
            </span>
            <input
              type="email"
              value={recContactEmail}
              onChange={(event) => setRecContactEmail(event.target.value)}
              className="w-full rounded-2xl border border-[var(--stroke)] bg-[var(--card)] px-4 py-3 text-base text-[var(--ink)] shadow-sm outline-none transition focus:border-[var(--accent)]"
            />
          </label>
        </div>

        <label className="block text-sm">
          <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
            Telephone (optionnel)
          </span>
          <input
            type="text"
            value={recContactPhone}
            onChange={(event) => setRecContactPhone(event.target.value)}
            className="w-full rounded-2xl border border-[var(--stroke)] bg-[var(--card)] px-4 py-3 text-base text-[var(--ink)] shadow-sm outline-none transition focus:border-[var(--accent)]"
          />
        </label>

        <label className="block text-sm">
          <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
            Texte de recommandation (visible uniquement par les parties)
          </span>
          <textarea
            required
            rows={5}
            value={text}
            onChange={(event) => setText(event.target.value)}
            className="w-full rounded-2xl border border-[var(--stroke)] bg-[var(--card)] px-4 py-3 text-base text-[var(--ink)] shadow-sm outline-none transition focus:border-[var(--accent)]"
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
          {loading ? "Envoi..." : "Envoyer"}
        </button>
      </form>
    </div>
  );
}
