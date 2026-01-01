import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashToken } from "@/lib/crypto";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token") ?? "";

  if (token.length < 10) {
    return NextResponse.json({ error: "INVALID_TOKEN" }, { status: 400 });
  }

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

  return NextResponse.json({
    ok: true,
    invitation: {
      email: invitation.email,
      role: invitation.role,
      memberId: invitation.memberId,
    },
  });
}
