import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { acceptInviteSchema } from "@/lib/validation";
import { hashPassword } from "@/lib/auth";
import { hashToken } from "@/lib/crypto";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = acceptInviteSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_INPUT" }, { status: 422 });
  }

  const { token, password } = parsed.data;
  const tokenHash = hashToken(token);

  const invitation = await prisma.invitation.findUnique({
    where: { tokenHash },
  });

  if (!invitation || invitation.acceptedAt || invitation.expireAt < new Date()) {
    return NextResponse.json({ error: "INVALID_TOKEN" }, { status: 400 });
  }

  if (!invitation.memberId) {
    return NextResponse.json({ error: "MISSING_MEMBER" }, { status: 409 });
  }

  const existing = await prisma.user.findFirst({
    where: { memberId: invitation.memberId },
  });

  if (existing) {
    return NextResponse.json({ error: "ACCOUNT_EXISTS" }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);

  await prisma.$transaction([
    prisma.user.create({
      data: {
        memberId: invitation.memberId,
        authEmail: invitation.email,
        role: invitation.role,
        passwordHash,
        passwordUpdatedAt: new Date(),
        emailVerifiedAt: new Date(),
      },
    }),
    prisma.invitation.update({
      where: { id: invitation.id },
      data: { acceptedAt: new Date() },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
