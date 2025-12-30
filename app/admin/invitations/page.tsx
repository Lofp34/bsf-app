import { prisma } from "@/lib/prisma";
import InvitationsList from "./invitations-list";
import Pagination from "../pagination";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 25;

export default async function InvitationsPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const page = Math.max(1, Number(searchParams.page ?? "1"));
  const [totalInvitations, invitations] = await Promise.all([
    prisma.invitation.count(),
    prisma.invitation.findMany({
      orderBy: { sentAt: "desc" },
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
  const totalPages = Math.max(1, Math.ceil(totalInvitations / PAGE_SIZE));
  const serializedInvitations = invitations.map((invitation) => ({
    ...invitation,
    sentAt: invitation.sentAt.toISOString(),
    expireAt: invitation.expireAt.toISOString(),
    acceptedAt: invitation.acceptedAt ? invitation.acceptedAt.toISOString() : null,
  }));

  return (
    <main className="mx-auto w-full max-w-4xl">
      <header className="rounded-3xl border border-[var(--stroke)] bg-[var(--card)] p-8 shadow-sm">
        <h1 className="text-3xl font-semibold">Invitations</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Suivez les invitations envoyees et leur statut d&apos;activation.
        </p>
        <div className="mt-4 flex flex-wrap gap-3 text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
          <span className="rounded-full border border-[var(--stroke)] bg-white px-3 py-1">
            Total: {totalInvitations}
          </span>
          <span className="rounded-full border border-[var(--stroke)] bg-white px-3 py-1">
            Page: {page}/{totalPages}
          </span>
          <a
            href="/api/admin/invitations/export"
            className="rounded-full border border-[var(--stroke)] bg-white px-3 py-1 transition hover:border-[var(--accent)]"
          >
            Export CSV
          </a>
        </div>
      </header>

      <InvitationsList invitations={serializedInvitations} />
      <Pagination
        page={page}
        totalPages={totalPages}
        basePath="/admin/invitations"
      />
    </main>
  );
}
