import { prisma } from "@/lib/prisma";
import MembersList from "./members-list";

export const dynamic = "force-dynamic";

export default async function MembersPage() {
  const members = await prisma.member.findMany({
    orderBy: { createdAt: "desc" },
    take: 80,
  });

  return (
    <main className="mx-auto w-full max-w-4xl">
      <header className="rounded-3xl border border-[var(--stroke)] bg-[var(--card)] p-8 shadow-sm">
        <h1 className="text-3xl font-semibold">Annuaire des membres</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Liste recente des membres pour verifier les creations et consentements.
        </p>
        <div className="mt-4 flex flex-wrap gap-3 text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
          <span className="rounded-full border border-[var(--stroke)] bg-white px-3 py-1">
            Total: {members.length}
          </span>
          <span className="rounded-full border border-[var(--stroke)] bg-white px-3 py-1">
            Consentements actifs par defaut
          </span>
        </div>
      </header>

      <MembersList members={members} />
    </main>
  );
}
