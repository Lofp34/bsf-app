import { prisma } from "@/lib/prisma";
import UsersList from "./users-list";

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

      <UsersList users={users} />
    </main>
  );
}
