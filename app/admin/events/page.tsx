import { prisma } from "@/lib/prisma";
import EventsList from "./events-list";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function EventsPage() {
  const events = await prisma.event.findMany({
    orderBy: { startAt: "desc" },
    take: 80,
    include: {
      createdBy: {
        select: {
          authEmail: true,
          member: {
            select: {
              firstname: true,
              lastname: true,
            },
          },
        },
      },
    },
  });
  const serializedEvents = events.map((event) => ({
    id: event.id,
    title: event.title,
    location: event.location,
    status: event.status,
    capacity: event.capacity,
    startAt: event.startAt.toISOString(),
    createdByLabel: event.createdBy.member
      ? `${event.createdBy.member.firstname} ${event.createdBy.member.lastname}`
      : event.createdBy.authEmail,
  }));

  return (
    <main className="mx-auto w-full max-w-4xl">
      <header className="rounded-3xl border border-[var(--stroke)] bg-[var(--card)] p-8 shadow-sm">
        <h1 className="text-3xl font-semibold">Evenements</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Visualisez les evenements planifies et leur statut.
        </p>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Pour inviter des membres, utilisez l&apos;espace{" "}
          <Link
            href="/community/events"
            className="font-semibold text-[var(--ink)] underline decoration-[var(--accent)] decoration-2 underline-offset-4"
          >
            Communaute &gt; Activites
          </Link>
          .
        </p>
        <div className="mt-4 flex flex-wrap gap-3 text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
          <span className="rounded-full border border-[var(--stroke)] bg-white px-3 py-1">
            Total: {events.length}
          </span>
          <Link
            href="/admin/events/new"
            className="rounded-full border border-[var(--stroke)] bg-white px-3 py-1 transition hover:border-[var(--accent)]"
          >
            Creer
          </Link>
        </div>
      </header>

      <EventsList events={serializedEvents} />
    </main>
  );
}
