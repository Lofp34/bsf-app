import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSessionUser } from "@/lib/auth";
import { eventSchema } from "@/lib/validation";
import { logAudit } from "@/lib/audit";
import { UserRole } from "@prisma/client";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
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

  const existing = await prisma.event.findUnique({
    where: { id: params.id },
  });

  if (!existing) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  if (existing.status === "CANCELED") {
    return NextResponse.json({ error: "EVENT_CANCELED" }, { status: 409 });
  }

  const { title, type, startAt, location, description, capacity } = parsed.data;

  const event = await prisma.event.update({
    where: { id: existing.id },
    data: {
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
    action: "EVENT_UPDATED",
    metadata: { eventId: event.id, title },
  });

  return NextResponse.json({ ok: true });
}
