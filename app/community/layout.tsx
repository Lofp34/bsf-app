import { requireSessionUser } from "@/lib/auth";
import { UserRole } from "@prisma/client";
import Link from "next/link";

export default async function CommunityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
    <div className="min-h-screen">
      <div className="surface-grid min-h-screen">
        <div className="mx-auto grid min-h-screen max-w-6xl gap-6 px-6 py-10 lg:grid-cols-[220px_1fr]">
          <aside className="flex h-full flex-col gap-6">
            <div className="rounded-3xl border border-[var(--stroke)] bg-[var(--card)] px-5 py-6 shadow-sm">
              <p className="text-xs uppercase tracking-[0.35em] text-[var(--muted)]">
                Business Sud de France
              </p>
              <h2 className="mt-3 text-2xl font-semibold">Communaut&eacute;</h2>
              <p className="mt-2 text-xs text-[var(--muted)]">
                Recommandations et activites partag&eacute;es.
              </p>
            </div>
            <nav className="space-y-2">
              <Link
                href="/community/recommendations"
                className="block rounded-2xl border border-[var(--stroke)] bg-white px-4 py-3 text-sm font-semibold text-[var(--muted)] transition hover:border-[var(--accent)]"
              >
                Recommandations
              </Link>
              <Link
                href="/community/events"
                className="block rounded-2xl border border-[var(--stroke)] bg-white px-4 py-3 text-sm font-semibold text-[var(--muted)] transition hover:border-[var(--accent)]"
              >
                Activites
              </Link>
              {(user.role === UserRole.ADMIN || user.role === UserRole.SUPER_ADMIN) && (
                <Link
                  href="/admin"
                  className="block rounded-2xl border border-[var(--stroke)] bg-white px-4 py-3 text-sm font-semibold text-[var(--muted)] transition hover:border-[var(--accent)]"
                >
                  Admin
                </Link>
              )}
            </nav>
          </aside>
          <div className="pb-10">{children}</div>
        </div>
      </div>
    </div>
  );
}
