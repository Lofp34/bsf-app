import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSessionUser } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
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

  return NextResponse.json({ ok: true });
}
