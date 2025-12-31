import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSessionUser } from "@/lib/auth";
import { recommendationSchema } from "@/lib/validation";
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
  const parsed = recommendationSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_INPUT" }, { status: 422 });
  }

  const {
    recipientMemberId,
    recContactFirstname,
    recContactLastname,
    recContactCompany,
    recContactEmail,
    recContactPhone,
    text,
  } = parsed.data;

  const recommendation = await prisma.recommendation.create({
    data: {
      senderUserId: user.id,
      recipientMemberId,
      recContactFirstname,
      recContactLastname,
      recContactCompany: recContactCompany ?? null,
      recContactEmail: recContactEmail ?? null,
      recContactPhone: recContactPhone ?? null,
      text,
      followupDueAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.recommendationStatusHistory.create({
    data: {
      recommendationId: recommendation.id,
      oldStatus: "SENT",
      newStatus: "SENT",
      changedByUserId: user.id,
    },
  });

  await logAudit({
    actorUserId: user.id,
    action: "RECOMMENDATION_CREATED",
    metadata: { recommendationId: recommendation.id, recipientMemberId },
  });

  return NextResponse.json({ ok: true, recommendationId: recommendation.id });
}
