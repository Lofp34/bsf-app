"use client";

import { useMemo, useState } from "react";

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

type FilterKey =
  | "all"
  | "contact-yes"
  | "contact-no"
  | "hobbies-yes"
  | "hobbies-no";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "Tous" },
  { key: "contact-yes", label: "Contact oui" },
  { key: "contact-no", label: "Contact non" },
  { key: "hobbies-yes", label: "Loisirs oui" },
  { key: "hobbies-no", label: "Loisirs non" },
];

type Props = {
  members: Member[];
};

export default function MembersList({ members }: Props) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");

  const filteredMembers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return members.filter((member) => {
      const matchesQuery = normalizedQuery
        ? [
            member.firstname,
            member.lastname,
            member.company,
            member.email ?? "",
          ]
            .join(" ")
            .toLowerCase()
            .includes(normalizedQuery)
        : true;

      const matchesFilter =
        filter === "all"
          ? true
          : filter === "contact-yes"
            ? member.consentShareContact
            : filter === "contact-no"
              ? !member.consentShareContact
              : filter === "hobbies-yes"
                ? member.consentShareHobbies
                : !member.consentShareHobbies;

      return matchesQuery && matchesFilter;
    });
  }, [members, query, filter]);

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
            placeholder="Nom, societe, email"
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

      {filteredMembers.length === 0 && (
        <div className="rounded-2xl border border-dashed border-[var(--stroke)] bg-white px-5 py-6 text-sm text-[var(--muted)]">
          Aucun membre ne correspond a vos filtres.
        </div>
      )}

      {filteredMembers.map((member) => (
        <div
          key={member.id}
          className="rounded-2xl border border-[var(--stroke)] bg-white px-5 py-5 shadow-sm"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-lg font-semibold text-[var(--ink)]">
                {member.firstname} {member.lastname}
              </p>
              <p className="text-sm text-[var(--muted)]">{member.company}</p>
              <div className="mt-3 space-y-1 text-xs text-[var(--muted)]">
                <p>Email: {member.email ?? "Non renseigne"}</p>
                <p>Telephone: {member.phone ?? "Non renseigne"}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
              <span className="rounded-full border border-[var(--stroke)] px-3 py-1">
                Contact: {member.consentShareContact ? "Oui" : "Non"}
              </span>
              <span className="rounded-full border border-[var(--stroke)] px-3 py-1">
                Loisirs: {member.consentShareHobbies ? "Oui" : "Non"}
              </span>
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}
