import "server-only";

import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

type AuditOptions = {
  actorUserId: string;
  action: string;
  targetUserId?: string | null;
  metadata?: Prisma.InputJsonValue;
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
