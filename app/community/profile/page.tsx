import { requireSessionUser } from "@/lib/auth";
import { UserRole } from "@prisma/client";
import ProfileMemberCard from "./profile-member-card";

export const dynamic = "force-dynamic";

export default async function CommunityProfilePage() {
  let user;
  try {
    user = await requireSessionUser([
      UserRole.SUPER_ADMIN,
      UserRole.ADMIN,
      UserRole.USER,
    ]);
  } catch (error) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-3xl font-semibold">Acces refuse</h1>
        <p className="mt-3 text-sm text-[var(--muted)]">
          Vous devez etre connecte pour acceder a cet espace.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-4xl">
      <header className="rounded-3xl border border-[var(--stroke)] bg-[var(--card)] p-8 shadow-sm">
        <h1 className="text-3xl font-semibold">Mon profil</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Consultez vos informations de compte et de membre.
        </p>
      </header>

      <section className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-[var(--stroke)] bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold">Compte</h2>
          <div className="mt-3 space-y-2 text-sm text-[var(--muted)]">
            <p>Email: {user.authEmail}</p>
            <p>Role: {user.role}</p>
            <p>Statut: {user.isActive ? "Actif" : "Inactif"}</p>
            <p>
              Derniere connexion:{" "}
              {user.lastLoginAt
                ? new Intl.DateTimeFormat("fr-FR", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  }).format(user.lastLoginAt)
                : "Non renseignee"}
            </p>
          </div>
        </div>

        <ProfileMemberCard member={user.member} />
      </section>
    </main>
  );
}
