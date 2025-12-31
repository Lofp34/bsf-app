"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type Member = {
  id: string;
  firstname: string;
  lastname: string;
  company: string;
  email: string | null;
  phone: string | null;
  consentShareContact: boolean;
};

type Props = {
  members: Member[];
};

export default function CommunityMembersList({ members }: Props) {
  const [query, setQuery] = useState("");

  const filteredMembers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return members.filter((member) => {
      if (!normalizedQuery) return true;
      return [member.firstname, member.lastname, member.company]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
    });
  }, [members, query]);

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
            placeholder="Nom ou societe"
            className="mt-2 w-full rounded-2xl border border-[var(--stroke)] bg-[var(--card)] px-4 py-2 text-sm text-[var(--ink)] shadow-sm outline-none transition focus:border-[var(--accent)]"
          />
        </div>
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
          {filteredMembers.length} resultat
          {filteredMembers.length > 1 ? "s" : ""}
        </p>
      </div>

      {filteredMembers.length === 0 && (
        <div className="rounded-2xl border border-dashed border-[var(--stroke)] bg-white px-5 py-6 text-sm text-[var(--muted)]">
          Aucun membre ne correspond a votre recherche.
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
                {member.consentShareContact ? (
                  <>
                    <p>Email: {member.email ?? "Non renseigne"}</p>
                    <p>Telephone: {member.phone ?? "Non renseigne"}</p>
                  </>
                ) : (
                  <p>Coordonnees non partagees.</p>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-2 text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
              <span className="rounded-full border border-[var(--stroke)] px-3 py-1">
                Contact: {member.consentShareContact ? "Oui" : "Non"}
              </span>
            </div>
          </div>
          <div className="mt-4">
            <Link
              href={`/community/members/${member.id}`}
              className="inline-flex rounded-full border border-[var(--stroke)] px-3 py-2 text-xs uppercase tracking-[0.2em] text-[var(--muted)] transition hover:border-[var(--accent)]"
            >
              Voir la fiche
            </Link>
          </div>
        </div>
      ))}
    </section>
  );
}
