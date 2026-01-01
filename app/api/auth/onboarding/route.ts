import { NextResponse } from "next/server";
import { requireSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type OnboardingSteps = {
  profile?: boolean;
  directory?: boolean;
  recommendation?: boolean;
};

export async function GET() {
  let user;
  try {
    user = await requireSessionUser();
  } catch (error) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }
  const prefs = (user.notificationPrefs ?? {}) as Record<string, unknown>;
  return NextResponse.json({ onboarding: prefs.onboarding ?? null });
}

export async function PATCH(request: Request) {
  let user;
  try {
    user = await requireSessionUser();
  } catch (error) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }
  const body = await request.json().catch(() => null);
  const incoming = body && typeof body === "object" ? body : {};

  const incomingSteps = incoming.steps && typeof incoming.steps === "object" ? incoming.steps : {};
  const steps: OnboardingSteps = {};

  if (typeof incomingSteps.profile === "boolean") steps.profile = incomingSteps.profile;
  if (typeof incomingSteps.directory === "boolean") steps.directory = incomingSteps.directory;
  if (typeof incomingSteps.recommendation === "boolean")
    steps.recommendation = incomingSteps.recommendation;

  const prefs = (user.notificationPrefs ?? {}) as Record<string, unknown>;
  const existing = (prefs.onboarding ?? {}) as Record<string, unknown>;
  const existingSteps = (existing.steps ?? {}) as Record<string, boolean>;

  const nextOnboarding = {
    ...existing,
    steps: { ...existingSteps, ...steps },
    seenAt: typeof incoming.seenAt === "string" ? incoming.seenAt : existing.seenAt,
    completedAt:
      typeof incoming.completedAt === "string" ? incoming.completedAt : existing.completedAt,
  };

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      notificationPrefs: {
        ...(prefs as Record<string, unknown>),
        onboarding: nextOnboarding,
      },
    },
  });

  const updatedPrefs = (updated.notificationPrefs ?? {}) as Record<string, unknown>;
  return NextResponse.json({ onboarding: updatedPrefs.onboarding ?? null });
}
