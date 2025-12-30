import "server-only";

import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { generateToken, hashToken } from "@/lib/crypto";
import { UserRole } from "@prisma/client";

const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME ?? "bsf_session";
const SESSION_TTL_DAYS = Number(process.env.SESSION_TTL_DAYS ?? "7");
const MAX_FAILED_LOGINS = 5;
const LOCK_MINUTES = 15;

export async function verifyPassword(
  password: string,
  passwordHash: string,
): Promise<boolean> {
  return bcrypt.compare(password, passwordHash);
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function createSession(userId: string) {
  const token = generateToken();
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000);

  await prisma.session.create({
    data: {
      userId,
      tokenHash,
      expiresAt,
    },
  });

  cookies().set({
    name: SESSION_COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });

  return { token, expiresAt };
}

export async function revokeSession(token: string) {
  const tokenHash = hashToken(token);
  await prisma.session.updateMany({
    where: { tokenHash, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

export async function getSessionUser() {
  const token = cookies().get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  const tokenHash = hashToken(token);
  const session = await prisma.session.findFirst({
    where: {
      tokenHash,
      revokedAt: null,
      expiresAt: { gt: new Date() },
    },
    include: {
      user: { include: { member: true } },
    },
  });

  if (!session) return null;

  await prisma.session.update({
    where: { id: session.id },
    data: { lastUsedAt: new Date() },
  });

  return session.user;
}

export async function requireSessionUser(allowed?: UserRole[]) {
  const user = await getSessionUser();
  if (!user || !user.isActive) {
    throw new Error("UNAUTHORIZED");
  }
  if (allowed && !allowed.includes(user.role)) {
    throw new Error("FORBIDDEN");
  }
  return user;
}

export async function recordFailedLogin(userId: string) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      failedLoginCount: { increment: 1 },
    },
  });

  if (user.failedLoginCount + 1 >= MAX_FAILED_LOGINS) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        lockedUntil: new Date(Date.now() + LOCK_MINUTES * 60 * 1000),
      },
    });
  }
}

export async function clearLoginFailures(userId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: {
      failedLoginCount: 0,
      lockedUntil: null,
    },
  });
}
