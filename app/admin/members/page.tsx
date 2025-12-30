import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function MembersPage() {
  const members = await prisma.member.findMany({
    orderBy: { createdAt: "desc" },
    take: 80,
  });

  return (
    <main className="mx-auto w-full max-w-4xl">
      <header className="rounded-3xl border border-[var(--stroke)] bg-[var(--card)] p-8 shadow-sm">
        <h1 className="text-3xl font-semibold">Annuaire des membres</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Liste recente des membres pour verifier les creations et consentements.
        </p>
        <div className="mt-4 flex flex-wrap gap-3 text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
          <span className="rounded-full border border-[var(--stroke)] bg-white px-3 py-1">
            Total: {members.length}
          </span>
          <span className="rounded-full border border-[var(--stroke)] bg-white px-3 py-1">
            Consentements actifs par defaut
          </span>
        </div>
      </header>

      <section className="mt-6 space-y-4">
        {members.length === 0 && (
          <div className="rounded-2xl border border-dashed border-[var(--stroke)] bg-white px-5 py-6 text-sm text-[var(--muted)]">
            Aucun membre pour le moment.
          </div>
        )}
        {members.map((member) => (
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
    </main>
  );
}
