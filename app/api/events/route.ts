import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSessionUser } from "@/lib/auth";
import { eventCreateSchema } from "@/lib/validation";
import { logAudit } from "@/lib/audit";
import { buildEventInviteEmail, getAppUrl, sendBulkEmail } from "@/lib/email";
import { UserRole } from "@prisma/client";

export async function POST(request: Request) {
  let user;
  try {
    user = await requireSessionUser([
      UserRole.SUPER_ADMIN,
      UserRole.ADMIN,
      UserRole.USER,
    ]);
  } catch (error) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = eventCreateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_INPUT" }, { status: 422 });
  }

  const {
    title,
    type,
    startAt,
    location,
    description,
    capacity,
    audience,
    inviteAll,
    inviteMemberIds,
  } = parsed.data;

  const finalAudience = inviteAll ? "PUBLIC" : audience;
  if (finalAudience === "SELECTED" && inviteMemberIds.length === 0) {
    return NextResponse.json({ error: "INVITES_REQUIRED" }, { status: 422 });
  }

  const event = await prisma.event.create({
    data: {
      createdByUserId: user.id,
      title,
      type: type ?? null,
      startAt: new Date(startAt),
      location,
      description,
      capacity: capacity ?? null,
      audience: finalAudience,
    },
  });

  await prisma.eventRsvp.create({
    data: {
      eventId: event.id,
      userId: user.id,
      status: "GOING",
    },
  });

  if (finalAudience === "SELECTED") {
    const uniqueInvites = Array.from(
      new Set([user.memberId, ...inviteMemberIds]),
    ).filter((id): id is string => Boolean(id));
    if (uniqueInvites.length > 0) {
      await prisma.eventInvite.createMany({
        data: uniqueInvites.map((memberId) => ({
          eventId: event.id,
          memberId,
          invitedByUserId: user.id,
        })),
        skipDuplicates: true,
      });

      const appUrl = getAppUrl(request);
      if (appUrl) {
        const members = await prisma.member.findMany({
          where: { id: { in: uniqueInvites } },
          select: { email: true },
        });
        const emails = members
          .map((member) => member.email)
          .filter((email): email is string => Boolean(email));
        const link = `${appUrl}/community/events/${event.id}`;

        await sendBulkEmail(emails, () =>
          buildEventInviteEmail({
            title,
            startAt: new Date(startAt),
            location,
            link,
          }),
        );
      }
    }
  }

  await logAudit({
    actorUserId: user.id,
    action: "EVENT_CREATED",
    metadata: { eventId: event.id, title, audience: finalAudience },
  });

  return NextResponse.json({ ok: true, eventId: event.id });
}
