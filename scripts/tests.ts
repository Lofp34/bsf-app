import {
  loginSchema,
  invitationSchema,
  acceptInviteSchema,
  memberSchema,
  eventSchema,
  eventCreateSchema,
  recommendationSchema,
  recommendationStatusSchema,
} from "../lib/validation";
import { hasRole, requireRole } from "../lib/rbac";

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

function testSchemas() {
  const okLogin = loginSchema.safeParse({
    email: "admin@example.com",
    password: "password123",
  });
  assert(okLogin.success, "loginSchema should accept valid input");

  const badLogin = loginSchema.safeParse({ email: "nope" });
  assert(!badLogin.success, "loginSchema should reject invalid input");

  const okInvite = invitationSchema.safeParse({
    email: "invite@example.com",
    role: "ADMIN",
  });
  assert(okInvite.success, "invitationSchema should accept valid input");

  const okAccept = acceptInviteSchema.safeParse({
    token: "token-123456",
    password: "password123",
    acceptTerms: true,
  });
  assert(okAccept.success, "acceptInviteSchema should accept valid input");

  const okMember = memberSchema.safeParse({
    firstname: "Camille",
    lastname: "Morel",
    company: "BSF",
    email: "camille@example.com",
  });
  assert(okMember.success, "memberSchema should accept valid input");

  const okEvent = eventSchema.safeParse({
    title: "Rencontre",
    startAt: new Date().toISOString(),
    location: "Montpellier",
    description: "Session de mise en relation",
  });
  assert(okEvent.success, "eventSchema should accept valid input");

  const okEventCreate = eventCreateSchema.safeParse({
    title: "Rencontre",
    startAt: new Date().toISOString(),
    location: "Montpellier",
    description: "Session de mise en relation",
    audience: "PUBLIC",
  });
  assert(okEventCreate.success, "eventCreateSchema should accept valid input");

  const okRecommendation = recommendationSchema.safeParse({
    recipientMemberId: "member-123",
    recContactFirstname: "Lina",
    recContactLastname: "Bernard",
    text: "Recommandation forte pour un partenariat.",
  });
  assert(okRecommendation.success, "recommendationSchema should accept valid input");

  const okStatus = recommendationStatusSchema.safeParse({
    status: "VALIDATED",
    revenueAmount: 1200,
  });
  assert(okStatus.success, "recommendationStatusSchema should accept valid input");
}

function testRbac() {
  const ADMIN = "ADMIN" as const;
  const USER = "USER" as const;
  assert(hasRole(ADMIN, [ADMIN]), "hasRole should allow admin");
  let forbidden = false;
  try {
    requireRole(USER, [ADMIN]);
  } catch (error) {
    forbidden = true;
  }
  assert(forbidden, "requireRole should throw when role is not allowed");
}

try {
  testSchemas();
  testRbac();
  console.log("All tests passed.");
} catch (error) {
  console.error("Tests failed:", error);
  process.exit(1);
}
