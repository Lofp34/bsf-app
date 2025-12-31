import { prisma } from "@/lib/prisma";
import CommunityMembersList from "./members-list";

export const dynamic = "force-dynamic";

export default async function CommunityMembersPage() {
  const members = await prisma.member.findMany({
    orderBy: [{ lastname: "asc" }, { firstname: "asc" }],
    select: {
      id: true,
      firstname: true,
      lastname: true,
      company: true,
      email: true,
      phone: true,
      consentShareContact: true,
    },
  });

  return (
    <main className="mx-auto w-full max-w-4xl">
      <header className="rounded-3xl border border-[var(--stroke)] bg-[var(--card)] p-8 shadow-sm">
        <h1 className="text-3xl font-semibold">Annuaire des membres</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Consultez les fiches des membres de la communaute.
        </p>
        <div className="mt-4 flex flex-wrap gap-3 text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
          <span className="rounded-full border border-[var(--stroke)] bg-white px-3 py-1">
            Total: {members.length}
          </span>
          <span className="rounded-full border border-[var(--stroke)] bg-white px-3 py-1">
            Partage selon consentement
          </span>
        </div>
      </header>

      <CommunityMembersList members={members} />
    </main>
  );
}
