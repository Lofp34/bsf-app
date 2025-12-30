import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 80,
    include: {
      member: {
        select: {
          firstname: true,
          lastname: true,
          company: true,
        },
      },
    },
  });

  return (
    <main className="mx-auto w-full max-w-4xl">
      <header className="rounded-3xl border border-[var(--stroke)] bg-[var(--card)] p-8 shadow-sm">
        <h1 className="text-3xl font-semibold">Utilisateurs</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Comptes actifs et roles attribues dans le reseau.
        </p>
        <div className="mt-4 flex flex-wrap gap-3 text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
          <span className="rounded-full border border-[var(--stroke)] bg-white px-3 py-1">
            Total: {users.length}
          </span>
        </div>
      </header>

      <section className="mt-6 space-y-4">
        {users.length === 0 && (
          <div className="rounded-2xl border border-dashed border-[var(--stroke)] bg-white px-5 py-6 text-sm text-[var(--muted)]">
            Aucun compte utilisateur pour le moment.
          </div>
        )}
        {users.map((user) => (
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
          </div>
        ))}
      </section>
    </main>
  );
}
