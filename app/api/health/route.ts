import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function GET() {
  try {
    await prisma.$queryRaw(Prisma.sql`SELECT 1`);
    return NextResponse.json({ ok: true, status: "ok" });
  } catch (error) {
    return NextResponse.json({ ok: false, status: "degraded" }, { status: 503 });
  }
}
