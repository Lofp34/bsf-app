import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import Link from "next/link";

export const dynamic = "force-dynamic";

type PageProps = {
  params: { id: string };
};

export default async function MemberDetailPage({ params }: PageProps) {
  const member = await prisma.member.findUnique({
    where: { id: params.id },
    include: {
      user: true,
    },
  });

  if (!member) {
    return (
      <main className="mx-auto w-full max-w-4xl">
        <div className="rounded-3xl border border-[var(--stroke)] bg-white px-6 py-8 shadow-sm">
          <h1 className="text-2xl font-semibold">Membre introuvable</h1>
          <Link
            href="/admin/members"
            className="mt-4 inline-flex rounded-full border border-[var(--stroke)] px-4 py-2 text-xs uppercase tracking-[0.2em] text-[var(--muted)]"
          >
            Retour a la liste
          </Link>
        </div>
      </main>
    );
  }

  const orFilters: Prisma.AuditLogWhereInput[] = [
    { metadata: { path: ["memberId"], equals: member.id } },
  ];
  if (member.user?.id) {
    orFilters.push({ targetUserId: member.user.id });
  }

  const [audits, invitations] = await Promise.all([
    prisma.auditLog.findMany({
      where: { OR: orFilters },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        actor: { select: { authEmail: true } },
      },
    }),
    prisma.invitation.findMany({
      where: { memberId: member.id },
      orderBy: { sentAt: "desc" },
      take: 20,
    }),
  ]);

  const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <main className="mx-auto w-full max-w-4xl">
      <header className="rounded-3xl border border-[var(--stroke)] bg-[var(--card)] p-8 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold">
              {member.firstname} {member.lastname}
            </h1>
            <p className="mt-2 text-sm text-[var(--muted)]">{member.company}</p>
            <div className="mt-3 space-y-1 text-xs text-[var(--muted)]">
              <p>Email: {member.email ?? "Non renseigne"}</p>
              <p>Telephone: {member.phone ?? "Non renseigne"}</p>
              <p>Compte utilisateur: {member.user ? "Oui" : "Non"}</p>
            </div>
          </div>
          <Link
            href="/admin/members"
            className="inline-flex rounded-full border border-[var(--stroke)] bg-white px-4 py-2 text-xs uppercase tracking-[0.2em] text-[var(--muted)] transition hover:border-[var(--accent)]"
          >
            Retour
          </Link>
        </div>
      </header>

      <section className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-[var(--stroke)] bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold">Timeline</h2>
          <div className="mt-4 space-y-3 text-sm text-[var(--muted)]">
            <div className="rounded-xl border border-[var(--stroke)] bg-[var(--card)] px-4 py-3">
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                Creation membre
              </p>
              <p className="mt-1 text-sm text-[var(--ink)]">
                {dateFormatter.format(member.createdAt)}
              </p>
            </div>
            {audits.length === 0 && (
              <div className="rounded-xl border border-dashed border-[var(--stroke)] bg-white px-4 py-3">
                Aucun audit enregistre.
              </div>
            )}
            {audits.map((audit) => (
              <div
                key={audit.id}
                className="rounded-xl border border-[var(--stroke)] bg-white px-4 py-3"
              >
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                  <span>{audit.action}</span>
                  <span>{dateFormatter.format(audit.createdAt)}</span>
                </div>
                <p className="mt-2 text-xs text-[var(--muted)]">
                  Par {audit.actor?.authEmail ?? "Systeme"}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--stroke)] bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold">Invitations</h2>
          <div className="mt-4 space-y-3 text-sm text-[var(--muted)]">
            {invitations.length === 0 && (
              <div className="rounded-xl border border-dashed border-[var(--stroke)] bg-white px-4 py-3">
                Aucune invitation pour ce membre.
              </div>
            )}
            {invitations.map((invitation) => (
              <div
                key={invitation.id}
                className="rounded-xl border border-[var(--stroke)] bg-[var(--card)] px-4 py-3"
              >
                <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                  Envoyee le {dateFormatter.format(invitation.sentAt)}
                </p>
                <p className="mt-2 text-sm text-[var(--ink)]">
                  Role: {invitation.role}
                </p>
                <p className="text-xs text-[var(--muted)]">
                  {invitation.acceptedAt ? "Acceptee" : "En attente"}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
