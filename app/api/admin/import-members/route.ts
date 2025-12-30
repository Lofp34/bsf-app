import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { prisma } from "@/lib/prisma";
import { requireSessionUser } from "@/lib/auth";
import { UserRole } from "@prisma/client";
import { buildMemberKey, parseRows } from "@/lib/import-members";

export async function POST(request: Request) {
  let user;
  try {
    user = await requireSessionUser([UserRole.SUPER_ADMIN]);
  } catch (error) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  const formData = await request.formData().catch(() => null);
  if (!formData) {
    return NextResponse.json({ error: "INVALID_FORM" }, { status: 422 });
  }

  const file = formData.get("file");
  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "FILE_REQUIRED" }, { status: 422 });
  }

  const arrayBuffer = await (file as File).arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  let rows: Record<string, unknown>[] = [];
  try {
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      return NextResponse.json({ error: "EMPTY_FILE" }, { status: 422 });
    }
    const sheet = workbook.Sheets[sheetName];
    rows = XLSX.utils.sheet_to_json(sheet, { defval: "" }) as Record<string, unknown>[];
  } catch (error) {
    return NextResponse.json({ error: "PARSE_FAILED" }, { status: 422 });
  }

  const { members, errors } = parseRows(rows);
  const seen = new Set<string>();
  const uniqueMembers = [] as typeof members;

  for (const member of members) {
    const key = buildMemberKey(member);
    if (seen.has(key)) {
      errors.push({ row: member.sourceRow, message: "Doublon dans le fichier." });
      continue;
    }
    seen.add(key);
    uniqueMembers.push(member);
  }

  const emails = uniqueMembers
    .map((member) => member.email?.trim().toLowerCase())
    .filter(Boolean) as string[];

  const existingEmails = new Set<string>();
  if (emails.length) {
    const existing = await prisma.member.findMany({
      where: { email: { in: emails } },
      select: { email: true },
    });
    existing.forEach((entry) => {
      if (entry.email) existingEmails.add(entry.email.toLowerCase());
    });
  }

  let created = 0;
  let skipped = 0;

  for (const member of uniqueMembers) {
    const email = member.email?.trim().toLowerCase();
    if (email && existingEmails.has(email)) {
      skipped += 1;
      errors.push({ row: member.sourceRow, message: "Email deja present." });
      continue;
    }

    if (!email) {
      const existingByName = await prisma.member.findFirst({
        where: {
          firstname: member.firstname,
          lastname: member.lastname,
          company: member.company,
        },
        select: { id: true },
      });
      if (existingByName) {
        skipped += 1;
        errors.push({ row: member.sourceRow, message: "Doublon nom/prenom/societe." });
        continue;
      }
    }

    try {
      await prisma.member.create({
        data: {
          firstname: member.firstname,
          lastname: member.lastname,
          company: member.company,
          email: email ?? null,
          phone: member.phone ?? null,
          consentShareContact: true,
          consentShareHobbies: true,
        },
      });
      created += 1;
    } catch (error) {
      skipped += 1;
      errors.push({ row: member.sourceRow, message: "Echec creation en base." });
    }
  }

  await prisma.auditLog.create({
    data: {
      actorUserId: user.id,
      action: "MEMBER_IMPORT",
      metadata: {
        created,
        skipped,
        errors: errors.length,
      },
    },
  });

  return NextResponse.json({
    ok: true,
    created,
    skipped,
    errors,
  });
}
