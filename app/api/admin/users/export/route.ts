import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSessionUser } from "@/lib/auth";
import { UserRole } from "@prisma/client";

function escapeCsv(value: string) {
  if (value.includes('"') || value.includes(",") || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function GET() {
  try {
    await requireSessionUser([UserRole.SUPER_ADMIN, UserRole.ADMIN]);
  } catch (error) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      member: {
        select: {
          firstname: true,
          lastname: true,
          company: true,
        },
      },
    },
  });

  const header = [
    "id",
    "authEmail",
    "role",
    "isActive",
    "member",
    "createdAt",
    "lastLoginAt",
  ];

  const rows = users.map((user) => {
    const memberLabel = user.member
      ? `${user.member.firstname} ${user.member.lastname} · ${user.member.company}`
      : "";
    return [
      user.id,
      user.authEmail,
      user.role,
      String(user.isActive),
      memberLabel,
      user.createdAt.toISOString(),
      user.lastLoginAt ? user.lastLoginAt.toISOString() : "",
    ]
      .map(escapeCsv)
      .join(",");
  });

  const csv = [header.join(","), ...rows].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=users.csv",
    },
  });
}
