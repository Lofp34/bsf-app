import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  clearLoginFailures,
  createSession,
  recordFailedLogin,
  verifyPassword,
} from "@/lib/auth";
import { loginSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_INPUT" }, { status: 422 });
  }

  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({
    where: { authEmail: email },
    include: { member: true },
  });

  if (!user || !user.passwordHash) {
    return NextResponse.json({ error: "INVALID_CREDENTIALS" }, { status: 401 });
  }

  if (!user.isActive) {
    return NextResponse.json({ error: "ACCOUNT_DISABLED" }, { status: 403 });
  }

  if (user.lockedUntil && user.lockedUntil > new Date()) {
    return NextResponse.json({ error: "ACCOUNT_LOCKED" }, { status: 423 });
  }

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) {
    await recordFailedLogin(user.id);
    return NextResponse.json({ error: "INVALID_CREDENTIALS" }, { status: 401 });
  }

  await clearLoginFailures(user.id);
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  await createSession(user.id);

  return NextResponse.json({
    ok: true,
    user: {
      id: user.id,
      role: user.role,
      memberId: user.memberId,
    },
  });
}
