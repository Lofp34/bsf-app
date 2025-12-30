import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSessionUser } from "@/lib/auth";
import { generateToken, hashToken } from "@/lib/crypto";
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

  const invitation = await prisma.invitation.findUnique({
    where: { id: params.id },
  });

  if (!invitation) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  if (invitation.acceptedAt) {
    return NextResponse.json({ error: "ALREADY_ACCEPTED" }, { status: 409 });
  }
  if (invitation.role === UserRole.SUPER_ADMIN && user.role !== UserRole.SUPER_ADMIN) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  const token = generateToken(24);
  const tokenHash = hashToken(token);

  await prisma.$transaction([
    prisma.invitation.update({
      where: { id: invitation.id },
      data: { expireAt: new Date() },
    }),
    prisma.invitation.create({
      data: {
        email: invitation.email,
        memberId: invitation.memberId,
        role: invitation.role,
        tokenHash,
        sentAt: new Date(),
        expireAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    }),
  ]);

  await logAudit({
    actorUserId: user.id,
    action: "INVITATION_RESENT",
    metadata: { invitationId: invitation.id, email: invitation.email },
  });

  return NextResponse.json({
    ok: true,
    token,
  });
}
