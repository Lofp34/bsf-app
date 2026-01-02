import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSessionUser } from "@/lib/auth";
import { recommendationStatusSchema } from "@/lib/validation";
import { logAudit } from "@/lib/audit";
import { buildRecommendationStatusEmail, getAppUrl, sendEmail } from "@/lib/email";
import { UserRole } from "@prisma/client";

export async function PATCH(
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
  const parsed = recommendationStatusSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_INPUT" }, { status: 422 });
  }

  const recommendation = await prisma.recommendation.findUnique({
    where: { id: params.id },
    include: {
      recipient: true,
      sender: true,
    },
  });

  if (!recommendation) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  if (
    recommendation.senderUserId !== user.id &&
    user.role !== UserRole.ADMIN &&
    user.role !== UserRole.SUPER_ADMIN
  ) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  const { status, revenueAmount, revenueCurrency } = parsed.data;
  const statusChanged = recommendation.status !== status;

  const updated = await prisma.recommendation.update({
    where: { id: recommendation.id },
    data: {
      status,
      statusUpdatedAt: new Date(),
      revenueAmount: revenueAmount ?? null,
      revenueCurrency: revenueCurrency ?? null,
    },
  });

  await prisma.recommendationStatusHistory.create({
    data: {
      recommendationId: recommendation.id,
      oldStatus: recommendation.status,
      newStatus: status,
      changedByUserId: user.id,
    },
  });

  await logAudit({
    actorUserId: user.id,
    action: "RECOMMENDATION_STATUS_UPDATED",
    metadata: { recommendationId: recommendation.id, status },
  });

  if (statusChanged && recommendation.sender?.authEmail) {
    const appUrl = getAppUrl(request);
    const link = appUrl ? `${appUrl}/community/recommendations` : "";
    const recipientName = `${recommendation.recipient.firstname} ${recommendation.recipient.lastname}`;
    const emailPayload = buildRecommendationStatusEmail({
      status,
      recipientName,
      link,
    });
    await sendEmail({
      to: recommendation.sender.authEmail,
      subject: emailPayload.subject,
      text: emailPayload.text,
      html: emailPayload.html,
    });
  }

  return NextResponse.json({ ok: true, status: updated.status });
}
