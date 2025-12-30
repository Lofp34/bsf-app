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

  const invitations = await prisma.invitation.findMany({
    orderBy: { sentAt: "desc" },
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
    "email",
    "role",
    "status",
    "sentAt",
    "expireAt",
    "acceptedAt",
    "member",
  ];

  const now = new Date();
  const rows = invitations.map((invitation) => {
    const status =
      invitation.acceptedAt !== null
        ? "accepted"
        : invitation.expireAt < now
          ? "expired"
          : "pending";
    const memberLabel = invitation.member
      ? `${invitation.member.firstname} ${invitation.member.lastname} · ${invitation.member.company}`
      : "";
    return [
      invitation.id,
      invitation.email,
      invitation.role,
      status,
      invitation.sentAt.toISOString(),
      invitation.expireAt.toISOString(),
      invitation.acceptedAt ? invitation.acceptedAt.toISOString() : "",
      memberLabel,
    ]
      .map(escapeCsv)
      .join(",");
  });

  const csv = [header.join(","), ...rows].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=invitations.csv",
    },
  });
}
