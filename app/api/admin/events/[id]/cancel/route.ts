import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSessionUser } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { buildEventCanceledEmail, getAppUrl, sendBulkEmail } from "@/lib/email";
import { UserRole } from "@prisma/client";

export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  let user;
  try {
    user = await requireSessionUser([UserRole.SUPER_ADMIN, UserRole.ADMIN]);
  } catch (error) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  const event = await prisma.event.findUnique({
    where: { id: params.id },
    include: {
      invites: { include: { member: { select: { email: true } } } },
      rsvps: { include: { user: { select: { authEmail: true } } } },
    },
  });

  if (!event) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  if (event.status === "CANCELED") {
    return NextResponse.json({ error: "ALREADY_CANCELED" }, { status: 409 });
  }

  await prisma.event.update({
    where: { id: event.id },
    data: {
      status: "CANCELED",
      canceledAt: new Date(),
    },
  });

  await logAudit({
    actorUserId: user.id,
    action: "EVENT_CANCELED",
    metadata: { eventId: event.id, title: event.title },
  });

  const appUrl = getAppUrl(request);
  if (appUrl) {
    const invitedEmails = event.invites
      .map((invite) => invite.member.email)
      .filter((email): email is string => Boolean(email));
    const rsvpEmails = event.rsvps
      .map((rsvp) => rsvp.user.authEmail)
      .filter((email): email is string => Boolean(email));
    const link = `${appUrl}/community/events/${event.id}`;

    await sendBulkEmail([...invitedEmails, ...rsvpEmails], () =>
      buildEventCanceledEmail({
        title: event.title,
        startAt: event.startAt,
        location: event.location,
        link,
      }),
    );
  }

  return NextResponse.json({ ok: true });
}
