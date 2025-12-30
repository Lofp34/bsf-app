import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function InvitationsPage() {
  const invitations = await prisma.invitation.findMany({
    orderBy: { sentAt: "desc" },
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

  const now = new Date();
  const dateFormatter = new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" });

  return (
    <main className="mx-auto w-full max-w-4xl">
      <header className="rounded-3xl border border-[var(--stroke)] bg-[var(--card)] p-8 shadow-sm">
        <h1 className="text-3xl font-semibold">Invitations</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Suivez les invitations envoyees et leur statut d&apos;activation.
        </p>
        <div className="mt-4 flex flex-wrap gap-3 text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
          <span className="rounded-full border border-[var(--stroke)] bg-white px-3 py-1">
            Total: {invitations.length}
          </span>
        </div>
      </header>

      <section className="mt-6 space-y-4">
        {invitations.length === 0 && (
          <div className="rounded-2xl border border-dashed border-[var(--stroke)] bg-white px-5 py-6 text-sm text-[var(--muted)]">
            Aucune invitation envoyee.
          </div>
        )}
        {invitations.map((invitation) => {
          const isExpired = invitation.expireAt < now && !invitation.acceptedAt;
          const statusLabel = invitation.acceptedAt
            ? "Acceptee"
            : isExpired
              ? "Expiree"
              : "En attente";
          const statusTone = invitation.acceptedAt
            ? "text-emerald-700"
            : isExpired
              ? "text-red-600"
              : "text-[var(--accent)]";

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
                    Envoyee le {dateFormatter.format(invitation.sentAt)}
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
            </div>
          );
        })}
      </section>
    </main>
  );
}
