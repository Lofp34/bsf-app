import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireSessionUser } from "@/lib/auth";
import { UserRole } from "@prisma/client";
import CommunityEventForm from "../../event-form";

export const dynamic = "force-dynamic";

type PageProps = {
  params: { id: string };
};

function toLocalInput(date: Date) {
  return date.toISOString().slice(0, 16);
}

export default async function CommunityEventEditPage({ params }: PageProps) {
  let user;
  try {
    user = await requireSessionUser([
      UserRole.SUPER_ADMIN,
      UserRole.ADMIN,
      UserRole.USER,
    ]);
  } catch (error) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-3xl font-semibold">Acces refuse</h1>
        <p className="mt-3 text-sm text-[var(--muted)]">
          Vous devez etre connecte pour acceder a cet espace.
        </p>
      </main>
    );
  }

  const event = await prisma.event.findUnique({
    where: { id: params.id },
  });

  if (!event) {
    return (
      <main className="mx-auto w-full max-w-4xl">
        <div className="rounded-3xl border border-[var(--stroke)] bg-white px-6 py-8 shadow-sm">
          <h1 className="text-2xl font-semibold">Activite introuvable</h1>
          <Link
            href="/community/events"
            className="mt-4 inline-flex rounded-full border border-[var(--stroke)] px-4 py-2 text-xs uppercase tracking-[0.2em] text-[var(--muted)]"
          >
            Retour a la liste
          </Link>
        </div>
      </main>
    );
  }

  if (
    event.createdByUserId !== user.id &&
    user.role !== UserRole.ADMIN &&
    user.role !== UserRole.SUPER_ADMIN
  ) {
    return (
      <main className="mx-auto w-full max-w-4xl">
        <div className="rounded-3xl border border-[var(--stroke)] bg-white px-6 py-8 shadow-sm">
          <h1 className="text-2xl font-semibold">Acces refuse</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Vous ne pouvez pas modifier cette activite.
          </p>
          <Link
            href="/community/events"
            className="mt-4 inline-flex rounded-full border border-[var(--stroke)] px-4 py-2 text-xs uppercase tracking-[0.2em] text-[var(--muted)]"
          >
            Retour a la liste
          </Link>
        </div>
      </main>
    );
  }

  const members = await prisma.member.findMany({
    orderBy: { lastname: "asc" },
    select: { id: true, firstname: true, lastname: true, company: true },
  });

  return (
    <main className="mx-auto w-full max-w-4xl">
      <header className="rounded-3xl border border-[var(--stroke)] bg-[var(--card)] p-8 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Modifier l&apos;activite</h1>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Mettez a jour les details de l&apos;activite.
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
        <CommunityEventForm
          members={members}
          mode="edit"
          eventId={event.id}
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
