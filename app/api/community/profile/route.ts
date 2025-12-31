import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSessionUser } from "@/lib/auth";
import { memberSchema } from "@/lib/validation";
import { Prisma, UserRole } from "@prisma/client";

export async function PATCH(request: Request) {
  let user;
  try {
    user = await requireSessionUser([
      UserRole.SUPER_ADMIN,
      UserRole.ADMIN,
      UserRole.USER,
    ]);
  } catch (error) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  if (!user.memberId) {
    return NextResponse.json({ error: "MISSING_MEMBER" }, { status: 409 });
  }

  const body = await request.json().catch(() => null);
  const parsed = memberSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_INPUT" }, { status: 422 });
  }

  const { firstname, lastname, company, email, phone, consentShareContact, consentShareHobbies } =
    parsed.data;

  try {
    await prisma.member.update({
      where: { id: user.memberId },
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
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return NextResponse.json({ error: "EMAIL_EXISTS" }, { status: 409 });
      }
    }
    return NextResponse.json({ error: "SERVER_ERROR" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
