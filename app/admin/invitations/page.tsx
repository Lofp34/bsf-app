import { prisma } from "@/lib/prisma";
import InvitationsList from "./invitations-list";

export const dynamic = "force-dynamic";

export default async function InvitationsPage() {
  const invitations = await prisma.invitation.findMany({
    orderBy: { sentAt: "desc" },
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
            Total: {invitations.length}
          </span>
        </div>
      </header>

      <InvitationsList invitations={serializedInvitations} />
    </main>
  );
}
