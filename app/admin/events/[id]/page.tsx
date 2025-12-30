import Link from "next/link";
import { prisma } from "@/lib/prisma";
import EventForm from "../event-form";

export const dynamic = "force-dynamic";

type PageProps = {
  params: { id: string };
};

function toLocalInput(date: Date) {
  return date.toISOString().slice(0, 16);
}

export default async function EventEditPage({ params }: PageProps) {
  const event = await prisma.event.findUnique({
    where: { id: params.id },
  });

  if (!event) {
    return (
      <main className="mx-auto w-full max-w-4xl">
        <div className="rounded-3xl border border-[var(--stroke)] bg-white px-6 py-8 shadow-sm">
          <h1 className="text-2xl font-semibold">Evenement introuvable</h1>
          <Link
            href="/admin/events"
            className="mt-4 inline-flex rounded-full border border-[var(--stroke)] px-4 py-2 text-xs uppercase tracking-[0.2em] text-[var(--muted)]"
          >
            Retour a la liste
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-4xl">
      <header className="rounded-3xl border border-[var(--stroke)] bg-[var(--card)] p-8 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Modifier l&apos;evenement</h1>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Mettez a jour les details ou annulez l&apos;evenement.
            </p>
          </div>
          <Link
            href="/admin/events"
            className="inline-flex rounded-full border border-[var(--stroke)] bg-white px-4 py-2 text-xs uppercase tracking-[0.2em] text-[var(--muted)] transition hover:border-[var(--accent)]"
          >
            Retour
          </Link>
        </div>
      </header>

      <div className="rounded-2xl border border-[var(--stroke)] bg-white p-6 shadow-sm">
        <EventForm
          mode="edit"
          eventId={event.id}
          status={event.status}
          initial={{
            title: event.title,
            type: event.type ?? "",
            startAt: toLocalInput(event.startAt),
            location: event.location,
            description: event.description,
            capacity: event.capacity ? String(event.capacity) : "",
          }}
        />
      </div>
    </main>
  );
}
