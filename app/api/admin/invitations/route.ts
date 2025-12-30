import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { invitationSchema } from "@/lib/validation";
import { hashToken, generateToken } from "@/lib/crypto";
import { requireSessionUser } from "@/lib/auth";
import { UserRole } from "@prisma/client";

export async function POST(request: Request) {
  try {
    await requireSessionUser([UserRole.SUPER_ADMIN, UserRole.ADMIN]);
  } catch (error) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = invitationSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_INPUT" }, { status: 422 });
  }

  const { email, memberId, role } = parsed.data;
  const token = generateToken(24);
  const tokenHash = hashToken(token);

  const invitation = await prisma.invitation.create({
    data: {
      email,
      memberId: memberId ?? null,
      role,
      tokenHash,
      sentAt: new Date(),
      expireAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return NextResponse.json({
    ok: true,
    invitationId: invitation.id,
    token,
  });
}
