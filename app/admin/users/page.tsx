import { prisma } from "@/lib/prisma";
import UsersList from "./users-list";
import Pagination from "../pagination";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 25;

export default async function UsersPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const page = Math.max(1, Number(searchParams.page ?? "1"));
  const [totalUsers, users] = await Promise.all([
    prisma.user.count(),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
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
  const totalPages = Math.max(1, Math.ceil(totalUsers / PAGE_SIZE));

  return (
    <main className="mx-auto w-full max-w-4xl">
      <header className="rounded-3xl border border-[var(--stroke)] bg-[var(--card)] p-8 shadow-sm">
        <h1 className="text-3xl font-semibold">Utilisateurs</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Comptes actifs et roles attribues dans le reseau.
        </p>
        <div className="mt-4 flex flex-wrap gap-3 text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
          <span className="rounded-full border border-[var(--stroke)] bg-white px-3 py-1">
            Total: {totalUsers}
          </span>
          <span className="rounded-full border border-[var(--stroke)] bg-white px-3 py-1">
            Page: {page}/{totalPages}
          </span>
          <a
            href="/api/admin/users/export"
            className="rounded-full border border-[var(--stroke)] bg-white px-3 py-1 transition hover:border-[var(--accent)]"
          >
            Export CSV
          </a>
        </div>
      </header>

      <UsersList users={users} />
      <Pagination page={page} totalPages={totalPages} basePath="/admin/users" />
    </main>
  );
}
