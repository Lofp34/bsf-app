import { loginSchema, invitationSchema, acceptInviteSchema } from "../lib/validation";
import { hasRole, requireRole } from "../lib/rbac";
import { buildMemberKey, normalizeHeader } from "../lib/import-members";

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
  });
  assert(okAccept.success, "acceptInviteSchema should accept valid input");
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

function testImportHelpers() {
  const header = normalizeHeader("Prénom");
  assert(header === "prenom", "normalizeHeader should strip accents");
  const key = buildMemberKey({
    firstname: "Anna",
    lastname: "Durand",
    company: "BSF",
    email: "Anna@Example.com",
    sourceRow: 1,
  });
  assert(key === "email:anna@example.com", "buildMemberKey should normalize email");
}

try {
  testSchemas();
  testRbac();
  testImportHelpers();
  console.log("All tests passed.");
} catch (error) {
  console.error("Tests failed:", error);
  process.exit(1);
}
