import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function StatusPage() {
  const [members, invitationsPending, usersActive, upcomingEvents] =
    await Promise.all([
      prisma.member.count(),
      prisma.invitation.count({
        where: { acceptedAt: null, expireAt: { gt: new Date() } },
      }),
      prisma.user.count({ where: { isActive: true } }),
      prisma.event.count({
        where: { startAt: { gt: new Date() }, status: "PUBLISHED" },
      }),
    ]);

  return (
    <main className="mx-auto w-full max-w-4xl">
      <header className="rounded-3xl border border-[var(--stroke)] bg-[var(--card)] p-8 shadow-sm">
        <h1 className="text-3xl font-semibold">Etat du systeme</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Vue rapide des indicateurs et de la sante applicative.
        </p>
      </header>

      <section className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-[var(--stroke)] bg-white p-6 shadow-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
            Membres
          </p>
          <p className="mt-2 text-3xl font-semibold text-[var(--ink)]">{members}</p>
        </div>
        <div className="rounded-2xl border border-[var(--stroke)] bg-white p-6 shadow-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
            Invitations en attente
          </p>
          <p className="mt-2 text-3xl font-semibold text-[var(--ink)]">
            {invitationsPending}
          </p>
        </div>
        <div className="rounded-2xl border border-[var(--stroke)] bg-white p-6 shadow-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
            Utilisateurs actifs
          </p>
          <p className="mt-2 text-3xl font-semibold text-[var(--ink)]">
            {usersActive}
          </p>
        </div>
        <div className="rounded-2xl border border-[var(--stroke)] bg-white p-6 shadow-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
            Evenements a venir
          </p>
          <p className="mt-2 text-3xl font-semibold text-[var(--ink)]">
            {upcomingEvents}
          </p>
        </div>
      </section>
    </main>
  );
}
