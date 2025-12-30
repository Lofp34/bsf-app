import "server-only";

import { prisma } from "@/lib/prisma";

type AuditOptions = {
  actorUserId: string;
  action: string;
  targetUserId?: string | null;
  metadata?: Record<string, unknown>;
};

export async function logAudit({
  actorUserId,
  action,
  targetUserId,
  metadata,
}: AuditOptions) {
  await prisma.auditLog.create({
    data: {
      actorUserId,
      action,
      targetUserId: targetUserId ?? null,
      metadata: metadata ?? undefined,
    },
  });
}
