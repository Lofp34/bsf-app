import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireSessionUser } from "@/lib/auth";
import { UserRole } from "@prisma/client";
import EventActions from "../event-actions";

export const dynamic = "force-dynamic";

type PageProps = {
  params: { id: string };
};

export default async function CommunityEventDetailPage({ params }: PageProps) {
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
    include: {
      createdBy: { include: { member: true } },
      invites: { include: { member: true } },
      rsvps: true,
    },
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

  const isInvited = event.invites.some(
    (invite) => invite.memberId === user.memberId,
  );
  const canManage =
    event.createdByUserId === user.id ||
    user.role === UserRole.ADMIN ||
    user.role === UserRole.SUPER_ADMIN;
  const canSeeInvites =
    event.audience === "PUBLIC" || isInvited || canManage;
  const goingCount = event.rsvps.filter((rsvp) => rsvp.status === "GOING").length;
  const remaining = event.capacity ? event.capacity - goingCount : null;

  const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <main className="mx-auto w-full max-w-4xl">
      <header className="rounded-3xl border border-[var(--stroke)] bg-[var(--card)] p-8 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold">{event.title}</h1>
            <p className="mt-2 text-sm text-[var(--muted)]">
              {dateFormatter.format(event.startAt)} · {event.location}
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

      <div className="mt-6 grid gap-6 md:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-2xl border border-[var(--stroke)] bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Details</h2>
          <p className="mt-3 text-sm text-[var(--muted)]">{event.description}</p>
          {event.audience === "SELECTED" && !isInvited && !canManage && (
            <div className="mt-4 rounded-2xl border border-dashed border-[var(--stroke)] bg-[var(--card)] px-4 py-3 text-sm text-[var(--muted)]">
              Selection en cours par le club. Vous verrez votre invitation ici
              si vous etes retenu.
            </div>
          )}
          <div className="mt-4 flex flex-wrap gap-2 text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
            <span className="rounded-full border border-[var(--stroke)] px-3 py-1">
              {event.audience === "PUBLIC" ? "Ouvert" : "Selection"}
            </span>
            <span className="rounded-full border border-[var(--stroke)] px-3 py-1">
              {event.status === "PUBLISHED" ? "Publie" : "Annule"}
            </span>
            {event.capacity && (
              <span className="rounded-full border border-[var(--stroke)] px-3 py-1">
                Places: {goingCount}/{event.capacity}
              </span>
            )}
            {remaining !== null && remaining <= 0 && (
              <span className="rounded-full border border-[var(--stroke)] px-3 py-1 text-red-600">
                Complet
              </span>
            )}
            {event.audience === "SELECTED" && (
              <span className="rounded-full border border-[var(--stroke)] px-3 py-1">
                {isInvited ? "Invite" : "Non invite"}
              </span>
            )}
          </div>
          <EventActions
            eventId={event.id}
            canManage={canManage}
            status={event.status}
          />
        </section>

        <section className="rounded-2xl border border-[var(--stroke)] bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Invites</h2>
          <div className="mt-4 space-y-2 text-sm text-[var(--muted)]">
            {!canSeeInvites && (
              <p className="rounded-xl border border-dashed border-[var(--stroke)] bg-[var(--card)] px-3 py-2">
                Liste reservee aux invites et aux administrateurs.
              </p>
            )}
            {canSeeInvites && event.invites.length === 0 && (
              <p className="rounded-xl border border-dashed border-[var(--stroke)] bg-[var(--card)] px-3 py-2">
                Ouvert a tout le reseau.
              </p>
            )}
            {canSeeInvites &&
              event.invites.map((invite) => (
                <div
                  key={invite.memberId}
                  className="rounded-xl border border-[var(--stroke)] bg-[var(--card)] px-3 py-2"
                >
                  {invite.member.firstname} {invite.member.lastname} ·{" "}
                  {invite.member.company}
                </div>
              ))}
          </div>
        </section>
      </div>
    </main>
  );
}
