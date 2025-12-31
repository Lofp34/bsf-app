"use client";

import { useState } from "react";

type Member = {
  id: string;
  firstname: string;
  lastname: string;
  company: string;
  email: string | null;
  phone: string | null;
  consentShareContact: boolean;
  consentShareHobbies: boolean;
};

type Props = {
  member: Member | null;
};

type Status = { type: "success" | "error"; message: string } | null;

function ProfileMemberEditor({ member }: { member: Member }) {
  const [editing, setEditing] = useState(false);
  const [status, setStatus] = useState<Status>(null);
  const [formState, setFormState] = useState<Member>(member);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);

    const response = await fetch("/api/community/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstname: formState.firstname,
        lastname: formState.lastname,
        company: formState.company,
        email: formState.email || null,
        phone: formState.phone || null,
        consentShareContact: formState.consentShareContact,
        consentShareHobbies: formState.consentShareHobbies,
      }),
    });

    const data = await response.json().catch(() => null);
    if (!response.ok) {
      setStatus({
        type: "error",
        message: data?.error ?? "Mise a jour impossible.",
      });
      return;
    }

    setStatus({ type: "success", message: "Fiche membre mise a jour." });
    setEditing(false);
  }

  return (
    <div className="rounded-2xl border border-[var(--stroke)] bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Fiche membre</h2>
          <div className="mt-3 space-y-2 text-sm text-[var(--muted)]">
            <p>
              {formState.firstname} {formState.lastname}
            </p>
            <p>Societe: {formState.company}</p>
            <p>Email: {formState.email ?? "Non renseigne"}</p>
            <p>Telephone: {formState.phone ?? "Non renseigne"}</p>
            <p>
              Consentement contact:{" "}
              {formState.consentShareContact ? "Oui" : "Non"}
            </p>
            <p>
              Consentement loisirs:{" "}
              {formState.consentShareHobbies ? "Oui" : "Non"}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditing((value) => !value);
            setStatus(null);
          }}
          aria-pressed={editing}
          title="Modifier ma fiche"
          className="inline-flex rounded-full border border-[var(--stroke)] bg-white px-4 py-2 text-xs uppercase tracking-[0.2em] text-[var(--muted)] transition hover:border-[var(--accent)]"
        >
          {editing ? "Annuler" : "Modifier ma fiche"}
        </button>
      </div>

      {editing && (
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm">
              <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                Prenom
              </span>
              <input
                type="text"
                required
                value={formState.firstname}
                onChange={(event) =>
                  setFormState({ ...formState, firstname: event.target.value })
                }
                className="w-full rounded-2xl border border-[var(--stroke)] bg-[var(--card)] px-4 py-2 text-sm text-[var(--ink)] shadow-sm outline-none transition focus:border-[var(--accent)]"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                Nom
              </span>
              <input
                type="text"
                required
                value={formState.lastname}
                onChange={(event) =>
                  setFormState({ ...formState, lastname: event.target.value })
                }
                className="w-full rounded-2xl border border-[var(--stroke)] bg-[var(--card)] px-4 py-2 text-sm text-[var(--ink)] shadow-sm outline-none transition focus:border-[var(--accent)]"
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
              value={formState.company}
              onChange={(event) =>
                setFormState({ ...formState, company: event.target.value })
              }
              className="w-full rounded-2xl border border-[var(--stroke)] bg-[var(--card)] px-4 py-2 text-sm text-[var(--ink)] shadow-sm outline-none transition focus:border-[var(--accent)]"
            />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm">
              <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                Email
              </span>
              <input
                type="email"
                value={formState.email ?? ""}
                onChange={(event) =>
                  setFormState({
                    ...formState,
                    email: event.target.value || null,
                  })
                }
                className="w-full rounded-2xl border border-[var(--stroke)] bg-[var(--card)] px-4 py-2 text-sm text-[var(--ink)] shadow-sm outline-none transition focus:border-[var(--accent)]"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                Telephone
              </span>
              <input
                type="text"
                value={formState.phone ?? ""}
                onChange={(event) =>
                  setFormState({
                    ...formState,
                    phone: event.target.value || null,
                  })
                }
                className="w-full rounded-2xl border border-[var(--stroke)] bg-[var(--card)] px-4 py-2 text-sm text-[var(--ink)] shadow-sm outline-none transition focus:border-[var(--accent)]"
              />
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex items-center gap-3 rounded-2xl border border-[var(--stroke)] bg-[var(--card)] px-4 py-3 text-sm text-[var(--muted)]">
              <input
                type="checkbox"
                checked={formState.consentShareContact}
                onChange={(event) =>
                  setFormState({
                    ...formState,
                    consentShareContact: event.target.checked,
                  })
                }
                className="h-4 w-4 accent-[var(--accent)]"
              />
              Partager mes coordonnees
            </label>
            <label className="flex items-center gap-3 rounded-2xl border border-[var(--stroke)] bg-[var(--card)] px-4 py-3 text-sm text-[var(--muted)]">
              <input
                type="checkbox"
                checked={formState.consentShareHobbies}
                onChange={(event) =>
                  setFormState({
                    ...formState,
                    consentShareHobbies: event.target.checked,
                  })
                }
                className="h-4 w-4 accent-[var(--accent)]"
              />
              Partager mes loisirs
            </label>
          </div>

          {status && (
            <p
              className={`rounded-2xl border px-4 py-2 text-sm ${
                status.type === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-red-200 bg-red-50 text-red-700"
              }`}
            >
              {status.message}
            </p>
          )}

          <button
            type="submit"
            className="w-full rounded-2xl bg-[var(--accent)] px-6 py-3 text-xs uppercase tracking-[0.3em] text-white transition hover:bg-[var(--accent-deep)]"
          >
            Enregistrer
          </button>
        </form>
      )}
    </div>
  );
}

export default function ProfileMemberCard({ member }: Props) {
  if (!member) {
    return (
      <div className="rounded-2xl border border-[var(--stroke)] bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold">Fiche membre</h2>
        <p className="mt-3 text-sm text-[var(--muted)]">
          Aucune fiche membre associee.
        </p>
      </div>
    );
  }
  return <ProfileMemberEditor member={member} />;
}
