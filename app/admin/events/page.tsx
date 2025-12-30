import { prisma } from "@/lib/prisma";

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

  const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <main className="mx-auto w-full max-w-4xl">
      <header className="rounded-3xl border border-[var(--stroke)] bg-[var(--card)] p-8 shadow-sm">
        <h1 className="text-3xl font-semibold">Evenements</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Visualisez les evenements planifies et leur statut.
        </p>
        <div className="mt-4 flex flex-wrap gap-3 text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
          <span className="rounded-full border border-[var(--stroke)] bg-white px-3 py-1">
            Total: {events.length}
          </span>
        </div>
      </header>

      <section className="mt-6 space-y-4">
        {events.length === 0 && (
          <div className="rounded-2xl border border-dashed border-[var(--stroke)] bg-white px-5 py-6 text-sm text-[var(--muted)]">
            Aucun evenement planifie pour le moment.
          </div>
        )}
        {events.map((event) => (
          <div
            key={event.id}
            className="rounded-2xl border border-[var(--stroke)] bg-white px-5 py-5 shadow-sm"
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-lg font-semibold text-[var(--ink)]">
                  {event.title}
                </p>
                <p className="text-sm text-[var(--muted)]">
                  {dateFormatter.format(event.startAt)} · {event.location}
                </p>
                <p className="mt-2 text-xs text-[var(--muted)]">
                  Cree par{" "}
                  {event.createdBy.member
                    ? `${event.createdBy.member.firstname} ${event.createdBy.member.lastname}`
                    : event.createdBy.authEmail}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                <span className="rounded-full border border-[var(--stroke)] px-3 py-1">
                  {event.status === "PUBLISHED" ? "Publie" : "Annule"}
                </span>
                {event.capacity && (
                  <span className="rounded-full border border-[var(--stroke)] px-3 py-1">
                    Cap: {event.capacity}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
