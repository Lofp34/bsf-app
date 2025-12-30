import { requireSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";
import InviteUserForm from "./invite-user-form";

export default async function AdminPage() {
  let user;
  try {
    user = await requireSessionUser([UserRole.SUPER_ADMIN, UserRole.ADMIN]);
  } catch (error) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-3xl font-semibold">Acces refuse</h1>
        <p className="mt-3 text-sm text-[var(--muted)]">
          Cette page est reservee aux administrateurs.
        </p>
      </main>
    );
  }

  const [recentMembers, recentInvitations] = await Promise.all([
    prisma.member.findMany({
      orderBy: { createdAt: "desc" },
      take: 120,
      select: {
        id: true,
        firstname: true,
        lastname: true,
        company: true,
        email: true,
      },
    }),
    prisma.invitation.findMany({
      orderBy: { sentAt: "desc" },
      take: 6,
      include: {
        member: {
          select: {
            firstname: true,
            lastname: true,
            company: true,
          },
        },
      },
    }),
  ]);

  const roleLabel = user.role.replace("_", " ");
  const isSuperAdmin = user.role === UserRole.SUPER_ADMIN;
  const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
  });
  const now = new Date();

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <section className="rounded-3xl border border-[var(--stroke)] bg-[var(--card)] p-8 shadow-sm surface-grid grain">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Espace Admin</h1>
            <p className="mt-3 max-w-2xl text-sm text-[var(--muted)]">
              Pilotez les operations MVP: invitations, suivi des acces et
              preparation des prochaines actions admin.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full border border-[var(--stroke)] bg-white px-4 py-1 text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
              {roleLabel}
            </span>
            <span className="rounded-full border border-[var(--stroke)] bg-white px-4 py-1 text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
              {user.isActive ? "Compte actif" : "Compte inactif"}
            </span>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-[var(--stroke)] bg-white p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
              Utilisateur
            </p>
            <p className="mt-2 text-lg font-semibold">{user.authEmail}</p>
            <p className="mt-1 text-xs text-[var(--muted)]">
              Acces securise par session HTTPOnly.
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--stroke)] bg-white p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
              Perimetre
            </p>
            <p className="mt-2 text-lg font-semibold">Admin MVP</p>
            <p className="mt-1 text-xs text-[var(--muted)]">
              Import, gestion users, futurs catalogues.
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--stroke)] bg-white p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
              Niveau
            </p>
            <p className="mt-2 text-lg font-semibold">
              {isSuperAdmin ? "Super Admin" : "Admin"}
            </p>
            <p className="mt-1 text-xs text-[var(--muted)]">
              {isSuperAdmin
                ? "Acces complet aux operations sensibles."
                : "Acces limite par role."}
            </p>
          </div>
        </div>
      </section>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <InviteUserForm
            members={recentMembers}
            canInviteSuperAdmin={isSuperAdmin}
          />
          <div className="rounded-2xl border border-[var(--stroke)] bg-[var(--card)] p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Actions MVP</h2>
              <span className="rounded-full border border-[var(--stroke)] px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-[var(--muted)]">
                En cours
              </span>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl border border-[var(--stroke)] bg-white p-4">
                <p className="text-sm font-semibold">Inviter un utilisateur</p>
                <p className="mt-1 text-xs text-[var(--muted)]">
                  Disponible dans l&apos;espace admin.
                </p>
                <div className="mt-4 w-full rounded-2xl border border-[var(--stroke)] bg-[var(--card)] px-4 py-2 text-center text-xs uppercase tracking-[0.3em] text-[var(--accent)]">
                  Live
                </div>
              </div>
              <div className="rounded-2xl border border-[var(--stroke)] bg-white p-4">
                <p className="text-sm font-semibold">Catalogue loisirs</p>
                <p className="mt-1 text-xs text-[var(--muted)]">
                  Structurer les categories et tags.
                </p>
                <button
                  type="button"
                  disabled
                  className="mt-4 w-full rounded-2xl border border-[var(--stroke)] px-4 py-2 text-xs uppercase tracking-[0.3em] text-[var(--muted)] opacity-70"
                >
                  A venir
                </button>
              </div>
              <div className="rounded-2xl border border-[var(--stroke)] bg-white p-4">
                <p className="text-sm font-semibold">Evenements</p>
                <p className="mt-1 text-xs text-[var(--muted)]">
                  Creer, planifier, publier.
                </p>
                <button
                  type="button"
                  disabled
                  className="mt-4 w-full rounded-2xl border border-[var(--stroke)] px-4 py-2 text-xs uppercase tracking-[0.3em] text-[var(--muted)] opacity-70"
                >
                  Bientot
                </button>
              </div>
              <div className="rounded-2xl border border-[var(--stroke)] bg-white p-4">
                <p className="text-sm font-semibold">Classements</p>
                <p className="mt-1 text-xs text-[var(--muted)]">
                  Metriques et mises en avant.
                </p>
                <button
                  type="button"
                  disabled
                  className="mt-4 w-full rounded-2xl border border-[var(--stroke)] px-4 py-2 text-xs uppercase tracking-[0.3em] text-[var(--muted)] opacity-70"
                >
                  A venir
                </button>
              </div>
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-2xl border border-[var(--stroke)] bg-[var(--card)] p-6">
            <h2 className="text-xl font-semibold">Invitations recentes</h2>
            <div className="mt-4 space-y-3 text-sm">
              {recentInvitations.length === 0 && (
                <p className="rounded-xl border border-dashed border-[var(--stroke)] bg-white px-4 py-3 text-[var(--muted)]">
                  Aucune invitation envoyee pour le moment.
                </p>
              )}
              {recentInvitations.map((invitation) => {
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
                    className="rounded-xl border border-[var(--stroke)] bg-white px-4 py-3"
                  >
                    <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                      <span>{dateFormatter.format(invitation.sentAt)}</span>
                      <span className={statusTone}>{statusLabel}</span>
                    </div>
                    <p className="mt-2 text-sm font-semibold text-[var(--ink)]">
                      {invitation.email}
                    </p>
                    <p className="text-xs text-[var(--muted)]">
                      {invitation.member
                        ? `${invitation.member.firstname} ${invitation.member.lastname} · ${invitation.member.company}`
                        : "Membre non lie"}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="rounded-2xl border border-[var(--stroke)] bg-[var(--card)] p-6">
            <h2 className="text-xl font-semibold">Checklist admin</h2>
            <ul className="mt-4 space-y-3 text-sm text-[var(--muted)]">
              <li className="flex items-start gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-[var(--accent)]" />
                Suivre les invitations en attente.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-[var(--accent)]" />
                Valider les consentements avant diffusion.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-[var(--accent)]" />
                Tester une session admin chaque semaine.
              </li>
            </ul>
          </div>
          <div className="rounded-2xl border border-[var(--stroke)] bg-white p-6">
            <h2 className="text-xl font-semibold">Etat du MVP</h2>
            <div className="mt-4 space-y-3 text-sm text-[var(--muted)]">
              <div className="flex items-center justify-between rounded-xl border border-[var(--stroke)] bg-[var(--card)] px-3 py-2">
                <span>Invitations</span>
                <span className="text-xs uppercase tracking-[0.2em] text-[var(--accent)]">
                  Live
                </span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-[var(--stroke)] bg-[var(--card)] px-3 py-2">
                <span>Catalogue loisirs</span>
                <span className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                  A venir
                </span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
