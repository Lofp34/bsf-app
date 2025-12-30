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

  const members = await prisma.member.findMany({
    orderBy: { createdAt: "desc" },
  });

  const header = [
    "id",
    "firstname",
    "lastname",
    "company",
    "email",
    "phone",
    "consentShareContact",
    "consentShareHobbies",
    "createdAt",
  ];

  const rows = members.map((member) =>
    [
      member.id,
      member.firstname,
      member.lastname,
      member.company,
      member.email ?? "",
      member.phone ?? "",
      String(member.consentShareContact),
      String(member.consentShareHobbies),
      member.createdAt.toISOString(),
    ]
      .map(escapeCsv)
      .join(","),
  );

  const csv = [header.join(","), ...rows].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=members.csv",
    },
  });
}
