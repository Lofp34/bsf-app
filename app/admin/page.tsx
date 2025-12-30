import { requireSessionUser } from "@/lib/auth";
import { UserRole } from "@prisma/client";
import ImportMembersForm from "./import-members-form";

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

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-3xl font-semibold">Espace Admin</h1>
      <p className="mt-3 text-sm text-[var(--muted)]">
        Connecte en tant que {user.authEmail}.
      </p>
      <div className="mt-8 space-y-6">
        <ImportMembersForm />
        <div className="rounded-2xl border border-[var(--stroke)] bg-[var(--card)] p-6">
          <h2 className="text-xl font-semibold">Actions MVP</h2>
          <ul className="mt-4 space-y-2 text-sm text-[var(--muted)]">
            <li>Inviter des utilisateurs (API /api/admin/invitations).</li>
            <li>Gerer le catalogue loisirs (a venir).</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
