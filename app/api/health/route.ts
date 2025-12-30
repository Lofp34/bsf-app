import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function GET() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ ok: false, status: "missing_db" }, { status: 503 });
  }
  try {
    await prisma.$queryRaw(Prisma.sql`SELECT 1`);
    return NextResponse.json({ ok: true, status: "ok" });
  } catch (error) {
    return NextResponse.json({ ok: false, status: "degraded" }, { status: 503 });
  }
}
