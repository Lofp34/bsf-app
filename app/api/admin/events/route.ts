import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSessionUser } from "@/lib/auth";
import { eventSchema } from "@/lib/validation";
import { logAudit } from "@/lib/audit";
import { UserRole } from "@prisma/client";

export async function POST(request: Request) {
  let user;
  try {
    user = await requireSessionUser([UserRole.SUPER_ADMIN, UserRole.ADMIN]);
  } catch (error) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = eventSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_INPUT" }, { status: 422 });
  }

  const { title, type, startAt, location, description, capacity } = parsed.data;

  const event = await prisma.event.create({
    data: {
      createdByUserId: user.id,
      title,
      type: type ?? null,
      startAt: new Date(startAt),
      location,
      description,
      capacity: capacity ?? null,
    },
  });

  await logAudit({
    actorUserId: user.id,
    action: "EVENT_CREATED",
    metadata: { eventId: event.id, title },
  });

  return NextResponse.json({ ok: true, eventId: event.id });
}
