import "server-only";

import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { generateToken, hashToken } from "@/lib/crypto";
import { UserRole } from "@prisma/client";

const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME ?? "bsf_session";
const SESSION_TTL_DAYS = Number(process.env.SESSION_TTL_DAYS ?? "7");
const CSRF_COOKIE_NAME = process.env.CSRF_COOKIE_NAME ?? "bsf_csrf";
const SESSION_ROTATE_DAYS = Number(process.env.SESSION_ROTATE_DAYS ?? "3");
const SESSION_IDLE_ROTATE_HOURS = Number(process.env.SESSION_IDLE_ROTATE_HOURS ?? "24");
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

  const cookieStore = cookies();
  cookieStore.set({
    name: SESSION_COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });

  setCsrfCookie(cookieStore, expiresAt);

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
  const cookieStore = cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
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

  const now = new Date();
  const shouldRotate = shouldRotateSession(session.createdAt, session.lastUsedAt);
  if (shouldRotate) {
    const newToken = generateToken();
    const newTokenHash = hashToken(newToken);
    const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000);

    await prisma.$transaction([
      prisma.session.update({
        where: { id: session.id },
        data: { revokedAt: now },
      }),
      prisma.session.create({
        data: {
          userId: session.userId,
          tokenHash: newTokenHash,
          expiresAt,
          lastUsedAt: now,
        },
      }),
    ]);

    cookieStore.set({
      name: SESSION_COOKIE_NAME,
      value: newToken,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      expires: expiresAt,
    });

    setCsrfCookie(cookieStore, expiresAt);
  } else {
    await prisma.session.update({
      where: { id: session.id },
      data: { lastUsedAt: now },
    });

    if (!cookieStore.get(CSRF_COOKIE_NAME)?.value) {
      setCsrfCookie(cookieStore, session.expiresAt);
    }
  }

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

function setCsrfCookie(cookieStore: ReturnType<typeof cookies>, expiresAt: Date) {
  const csrfToken = generateToken();
  cookieStore.set({
    name: CSRF_COOKIE_NAME,
    value: csrfToken,
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

function shouldRotateSession(createdAt: Date, lastUsedAt: Date | null) {
  const now = Date.now();
  const createdAtMs = createdAt.getTime();
  const lastUsedMs = (lastUsedAt ?? createdAt).getTime();
  const rotateAfterMs = SESSION_ROTATE_DAYS * 24 * 60 * 60 * 1000;
  const idleRotateMs = SESSION_IDLE_ROTATE_HOURS * 60 * 60 * 1000;

  return now - createdAtMs > rotateAfterMs || now - lastUsedMs > idleRotateMs;
}
