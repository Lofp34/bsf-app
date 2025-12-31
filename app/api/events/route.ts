import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSessionUser } from "@/lib/auth";
import { eventCreateSchema } from "@/lib/validation";
import { logAudit } from "@/lib/audit";
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

  const { title, type, startAt, location, description, capacity, audience, inviteAll, inviteMemberIds } =
    parsed.data;

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

  if (finalAudience === "SELECTED") {
    const uniqueInvites = Array.from(new Set(inviteMemberIds));
    if (uniqueInvites.length > 0) {
      await prisma.eventInvite.createMany({
        data: uniqueInvites.map((memberId) => ({
          eventId: event.id,
          memberId,
          invitedByUserId: user.id,
        })),
        skipDuplicates: true,
      });
    }
  }

  await logAudit({
    actorUserId: user.id,
    action: "EVENT_CREATED",
    metadata: { eventId: event.id, title, audience: finalAudience },
  });

  return NextResponse.json({ ok: true, eventId: event.id });
}
