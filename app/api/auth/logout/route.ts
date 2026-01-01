import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { revokeSession } from "@/lib/auth";

const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME ?? "bsf_session";
const CSRF_COOKIE_NAME = process.env.CSRF_COOKIE_NAME ?? "bsf_csrf";

export async function POST() {
  const token = cookies().get(SESSION_COOKIE_NAME)?.value;
  if (token) {
    await revokeSession(token);
  }

  cookies().set({
    name: SESSION_COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(0),
  });

  cookies().set({
    name: CSRF_COOKIE_NAME,
    value: "",
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(0),
  });

  return NextResponse.json({ ok: true });
}
