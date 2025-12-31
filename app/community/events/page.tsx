import { prisma } from "@/lib/prisma";
import { requireSessionUser } from "@/lib/auth";
import { UserRole } from "@prisma/client";
import Link from "next/link";
import CommunityEventsList from "./events-list";

export const dynamic = "force-dynamic";

export default async function CommunityEventsPage() {
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

  const events = await prisma.event.findMany({
    orderBy: { startAt: "desc" },
    take: 80,
    include: {
      createdBy: {
        select: {
          authEmail: true,
          member: { select: { firstname: true, lastname: true } },
        },
      },
      invites: true,
      rsvps: true,
    },
  });

  const serializedEvents = events.map((event) => ({
    id: event.id,
    title: event.title,
    location: event.location,
    status: event.status,
    audience: event.audience,
    capacity: event.capacity,
    goingCount: event.rsvps.filter((rsvp) => rsvp.status === "GOING").length,
    startAt: event.startAt.toISOString(),
    createdByLabel: event.createdBy.member
      ? `${event.createdBy.member.firstname} ${event.createdBy.member.lastname}`
      : event.createdBy.authEmail,
    createdByUserId: event.createdByUserId,
    isInvited: event.invites.some((invite) => invite.memberId === user.memberId),
    myRsvp:
      event.rsvps.find((rsvp) => rsvp.userId === user.id)?.status ?? null,
    canManage:
      event.createdByUserId === user.id ||
      user.role === UserRole.ADMIN ||
      user.role === UserRole.SUPER_ADMIN,
  }));

  return (
    <main className="mx-auto w-full max-w-5xl">
      <header className="rounded-3xl border border-[var(--stroke)] bg-[var(--card)] p-8 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Activites</h1>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Organisez des activites et rejoignez celles de la communaute.
            </p>
          </div>
          <Link
            href="/community/events/new"
            className="inline-flex rounded-full border border-[var(--stroke)] bg-white px-4 py-2 text-xs uppercase tracking-[0.2em] text-[var(--muted)] transition hover:border-[var(--accent)]"
          >
            Creer une activite
          </Link>
        </div>
      </header>

      <CommunityEventsList events={serializedEvents} />
    </main>
  );
}
