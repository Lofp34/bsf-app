"use client";

import { useState } from "react";
import { csrfHeaders } from "@/app/components/csrf";

type MemberResult = {
  ok: boolean;
  memberId: string;
};

export default function AddMemberForm() {
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [consentShareContact, setConsentShareContact] = useState(true);
  const [consentShareHobbies, setConsentShareHobbies] = useState(true);
  const [result, setResult] = useState<MemberResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);

    const response = await fetch("/api/admin/members", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...csrfHeaders() },
      body: JSON.stringify({
        firstname,
        lastname,
        company,
        email: email.trim() ? email.trim() : null,
        phone: phone.trim() ? phone.trim() : null,
        consentShareContact,
        consentShareHobbies,
      }),
    });

    const data = await response.json().catch(() => null);
    if (!response.ok || !data) {
      const errorLabel =
        data?.error === "EMAIL_EXISTS"
          ? "Cet email est deja utilise."
          : "Creation impossible.";
      setError(errorLabel);
      setLoading(false);
      return;
    }

    setResult(data);
    setFirstname("");
    setLastname("");
    setCompany("");
    setEmail("");
    setPhone("");
    setConsentShareContact(true);
    setConsentShareHobbies(true);
    setLoading(false);
  }

  return (
    <div className="rounded-2xl border border-[var(--stroke)] bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Ajouter un membre</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Creez un membre dans l&apos;annuaire avant de lui envoyer une invitation.
          </p>
        </div>
        <span className="rounded-full border border-[var(--stroke)] px-3 py-1 text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
          Admin
        </span>
      </div>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
              Prenom
            </span>
            <input
              type="text"
              required
              value={firstname}
              onChange={(event) => setFirstname(event.target.value)}
              className="w-full rounded-2xl border border-[var(--stroke)] bg-[var(--card)] px-4 py-3 text-base text-[var(--ink)] shadow-sm outline-none transition focus:border-[var(--accent)]"
              placeholder="Camille"
            />
          </label>

          <label className="block text-sm">
            <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
              Nom
            </span>
            <input
              type="text"
              required
              value={lastname}
              onChange={(event) => setLastname(event.target.value)}
              className="w-full rounded-2xl border border-[var(--stroke)] bg-[var(--card)] px-4 py-3 text-base text-[var(--ink)] shadow-sm outline-none transition focus:border-[var(--accent)]"
              placeholder="Morel"
            />
          </label>
        </div>

        <label className="block text-sm">
          <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
            Societe
          </span>
          <input
            type="text"
            required
            value={company}
            onChange={(event) => setCompany(event.target.value)}
            className="w-full rounded-2xl border border-[var(--stroke)] bg-[var(--card)] px-4 py-3 text-base text-[var(--ink)] shadow-sm outline-none transition focus:border-[var(--accent)]"
            placeholder="Entreprise Sud"
          />
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
              Email (optionnel)
            </span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-2xl border border-[var(--stroke)] bg-[var(--card)] px-4 py-3 text-base text-[var(--ink)] shadow-sm outline-none transition focus:border-[var(--accent)]"
              placeholder="prenom.nom@domaine.fr"
            />
          </label>

          <label className="block text-sm">
            <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
              Telephone (optionnel)
            </span>
            <input
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              className="w-full rounded-2xl border border-[var(--stroke)] bg-[var(--card)] px-4 py-3 text-base text-[var(--ink)] shadow-sm outline-none transition focus:border-[var(--accent)]"
              placeholder="+33 6 12 34 56 78"
            />
          </label>
        </div>

        <div className="rounded-2xl border border-[var(--stroke)] bg-[var(--card)] px-4 py-3 text-sm text-[var(--muted)]">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
            Consentements
          </p>
          <div className="mt-3 space-y-3">
            <label className="flex items-center gap-3 text-sm">
              <input
                type="checkbox"
                checked={consentShareContact}
                onChange={(event) => setConsentShareContact(event.target.checked)}
                className="h-4 w-4 accent-[var(--accent)]"
              />
              Partager les coordonnees avec le reseau.
            </label>
            <label className="flex items-center gap-3 text-sm">
              <input
                type="checkbox"
                checked={consentShareHobbies}
                onChange={(event) => setConsentShareHobbies(event.target.checked)}
                className="h-4 w-4 accent-[var(--accent)]"
              />
              Partager les centres d&apos;interet.
            </label>
          </div>
        </div>

        {error && (
          <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        {result && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            Membre cree. Rechargez la page pour l&apos;inviter.
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-2xl bg-[var(--accent)] px-6 py-3 text-xs uppercase tracking-[0.3em] text-white transition hover:bg-[var(--accent-deep)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Creation..." : "Creer le membre"}
        </button>
      </form>
    </div>
  );
}
