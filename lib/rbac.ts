import { UserRole } from "@prisma/client";

export function hasRole(userRole: UserRole, allowed: UserRole[]): boolean {
  return allowed.includes(userRole);
}

export function requireRole(userRole: UserRole | null, allowed: UserRole[]): void {
  if (!userRole || !hasRole(userRole, allowed)) {
    throw new Error("FORBIDDEN");
  }
}
