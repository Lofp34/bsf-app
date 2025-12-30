import { prisma } from "@/lib/prisma";
import MembersList from "./members-list";
import Pagination from "../pagination";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 25;

export default async function MembersPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const page = Math.max(1, Number(searchParams.page ?? "1"));
  const [totalMembers, members] = await Promise.all([
    prisma.member.count(),
    prisma.member.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
  ]);
  const totalPages = Math.max(1, Math.ceil(totalMembers / PAGE_SIZE));

  return (
    <main className="mx-auto w-full max-w-4xl">
      <header className="rounded-3xl border border-[var(--stroke)] bg-[var(--card)] p-8 shadow-sm">
        <h1 className="text-3xl font-semibold">Annuaire des membres</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Liste recente des membres pour verifier les creations et consentements.
        </p>
        <div className="mt-4 flex flex-wrap gap-3 text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
          <span className="rounded-full border border-[var(--stroke)] bg-white px-3 py-1">
            Total: {totalMembers}
          </span>
          <span className="rounded-full border border-[var(--stroke)] bg-white px-3 py-1">
            Page: {page}/{totalPages}
          </span>
          <span className="rounded-full border border-[var(--stroke)] bg-white px-3 py-1">
            Consentements actifs par defaut
          </span>
          <a
            href="/api/admin/members/export"
            className="rounded-full border border-[var(--stroke)] bg-white px-3 py-1 transition hover:border-[var(--accent)]"
          >
            Export CSV
          </a>
        </div>
      </header>

      <MembersList members={members} />
      <Pagination page={page} totalPages={totalPages} basePath="/admin/members" />
    </main>
  );
}
