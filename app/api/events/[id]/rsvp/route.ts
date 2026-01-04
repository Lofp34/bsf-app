import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSessionUser } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { UserRole } from "@prisma/client";
import { z } from "zod";

const rsvpSchema = z.object({
  status: z.enum(["GOING", "NOT_GOING"]),
});

export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
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
  const parsed = rsvpSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_INPUT" }, { status: 422 });
  }

  const event = await prisma.event.findUnique({
    where: { id: params.id },
    include: { invites: true },
  });

  if (!event) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  if (event.status === "CANCELED") {
    return NextResponse.json({ error: "EVENT_CANCELED" }, { status: 409 });
  }

  if (
    event.audience === "SELECTED" &&
    event.createdByUserId !== user.id &&
    !event.invites.some((invite) => invite.memberId === user.memberId)
  ) {
    return NextResponse.json({ error: "NOT_INVITED" }, { status: 403 });
  }

  const goingCount = await prisma.eventRsvp.count({
    where: { eventId: event.id, status: "GOING" },
  });

  const existing = await prisma.eventRsvp.findUnique({
    where: { eventId_userId: { eventId: event.id, userId: user.id } },
  });

  if (
    parsed.data.status === "GOING" &&
    event.capacity &&
    goingCount >= event.capacity &&
    !existing
  ) {
    return NextResponse.json({ error: "EVENT_FULL" }, { status: 409 });
  }

  await prisma.eventRsvp.upsert({
    where: { eventId_userId: { eventId: event.id, userId: user.id } },
    update: {
      status: parsed.data.status,
      rsvpAt: new Date(),
    },
    create: {
      eventId: event.id,
      userId: user.id,
      status: parsed.data.status,
    },
  });

  await logAudit({
    actorUserId: user.id,
    action: "EVENT_RSVP_UPDATED",
    metadata: { eventId: event.id, status: parsed.data.status },
  });

  return NextResponse.json({ ok: true });
}
