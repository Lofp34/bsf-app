import { requireSessionUser } from "@/lib/auth";
import { UserRole } from "@prisma/client";
import AdminNav from "./admin-nav";
import Link from "next/link";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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

  const roleLabel = user.role.replace("_", " ");
  const memberName = user.member
    ? `${user.member.firstname} ${user.member.lastname}`
    : user.authEmail;
  const initials = user.member
    ? `${user.member.firstname[0] ?? ""}${user.member.lastname[0] ?? ""}`.toUpperCase()
    : user.authEmail.slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen">
      <div className="surface-grid min-h-screen">
        <div className="mx-auto grid min-h-screen max-w-6xl gap-6 px-6 py-10 lg:grid-cols-[280px_1fr]">
          <AdminNav
            email={user.authEmail}
            roleLabel={roleLabel}
            memberName={memberName}
            initials={initials}
          />
          <div className="pb-10">
            <div className="mb-6 flex justify-end">
              <Link
                href="/community/recommendations"
                className="rounded-full border border-[var(--stroke)] bg-white px-4 py-2 text-xs uppercase tracking-[0.2em] text-[var(--muted)] transition hover:border-[var(--accent)]"
              >
                Communaute
              </Link>
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
