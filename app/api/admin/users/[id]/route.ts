import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSessionUser } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { UserRole } from "@prisma/client";
import { z } from "zod";

const actionSchema = z.object({
  action: z.enum(["deactivate", "activate"]),
});

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  let user;
  try {
    user = await requireSessionUser([UserRole.SUPER_ADMIN, UserRole.ADMIN]);
  } catch (error) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  if (params.id === user.id) {
    return NextResponse.json({ error: "SELF_ACTION_FORBIDDEN" }, { status: 409 });
  }

  const body = await request.json().catch(() => null);
  const parsed = actionSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_INPUT" }, { status: 422 });
  }

  const target = await prisma.user.findUnique({
    where: { id: params.id },
  });

  if (!target) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }
  if (target.role === UserRole.SUPER_ADMIN && user.role !== UserRole.SUPER_ADMIN) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  const now = new Date();
  const isDeactivate = parsed.data.action === "deactivate";

  await prisma.user.update({
    where: { id: target.id },
    data: {
      isActive: !isDeactivate,
      deactivatedAt: isDeactivate ? now : null,
      deactivatedById: isDeactivate ? user.id : null,
    },
  });

  await logAudit({
    actorUserId: user.id,
    action: isDeactivate ? "USER_DEACTIVATED" : "USER_ACTIVATED",
    targetUserId: target.id,
    metadata: { email: target.authEmail, memberId: target.memberId },
  });

  return NextResponse.json({ ok: true });
}
