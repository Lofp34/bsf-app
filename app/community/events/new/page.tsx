import Link from "next/link";
import { prisma } from "@/lib/prisma";
import CommunityEventForm from "../event-form";

export const dynamic = "force-dynamic";

export default async function CommunityEventCreatePage() {
  const members = await prisma.member.findMany({
    orderBy: { lastname: "asc" },
    select: { id: true, firstname: true, lastname: true, company: true },
  });

  return (
    <main className="mx-auto w-full max-w-4xl">
      <header className="rounded-3xl border border-[var(--stroke)] bg-[var(--card)] p-8 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Creer une activite</h1>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Invitez le reseau ou une selection de membres.
            </p>
          </div>
          <Link
            href="/community/events"
            className="inline-flex rounded-full border border-[var(--stroke)] bg-white px-4 py-2 text-xs uppercase tracking-[0.2em] text-[var(--muted)] transition hover:border-[var(--accent)]"
          >
            Retour
          </Link>
        </div>
      </header>

      <div className="rounded-2xl border border-[var(--stroke)] bg-white p-6 shadow-sm">
        <CommunityEventForm members={members} />
      </div>
    </main>
  );
}
