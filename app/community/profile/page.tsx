import { requireSessionUser } from "@/lib/auth";
import { UserRole } from "@prisma/client";

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

  const member = user.member;

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

        <div className="rounded-2xl border border-[var(--stroke)] bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold">Fiche membre</h2>
          <div className="mt-3 space-y-2 text-sm text-[var(--muted)]">
            {member ? (
              <>
                <p>
                  {member.firstname} {member.lastname}
                </p>
                <p>Societe: {member.company}</p>
                <p>Email: {member.email ?? "Non renseigne"}</p>
                <p>Telephone: {member.phone ?? "Non renseigne"}</p>
                <p>
                  Consentement contact:{" "}
                  {member.consentShareContact ? "Oui" : "Non"}
                </p>
                <p>
                  Consentement loisirs:{" "}
                  {member.consentShareHobbies ? "Oui" : "Non"}
                </p>
              </>
            ) : (
              <p>Aucune fiche membre associee.</p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
