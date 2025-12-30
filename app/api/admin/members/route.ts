import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { memberSchema } from "@/lib/validation";
import { requireSessionUser } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { Prisma, UserRole } from "@prisma/client";

export async function POST(request: Request) {
  let user;
  try {
    user = await requireSessionUser([UserRole.SUPER_ADMIN, UserRole.ADMIN]);
  } catch (error) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = memberSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_INPUT" }, { status: 422 });
  }

  const { firstname, lastname, company, email, phone, consentShareContact, consentShareHobbies } =
    parsed.data;

  try {
    const member = await prisma.member.create({
      data: {
        firstname,
        lastname,
        company,
        email: email ?? null,
        phone: phone ?? null,
        consentShareContact,
        consentShareHobbies,
      },
    });

    await logAudit({
      actorUserId: user.id,
      action: "MEMBER_CREATED",
      metadata: { memberId: member.id, email: member.email },
    });

    return NextResponse.json({ ok: true, memberId: member.id });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return NextResponse.json({ error: "EMAIL_EXISTS" }, { status: 409 });
      }
    }
    return NextResponse.json({ error: "SERVER_ERROR" }, { status: 500 });
  }
}
