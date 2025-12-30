import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

export const invitationSchema = z.object({
  email: z.string().email(),
  memberId: z.string().optional(),
  role: z.enum(["SUPER_ADMIN", "ADMIN", "USER"]),
});

export const acceptInviteSchema = z.object({
  token: z.string().min(10),
  password: z.string().min(8).max(128),
});

export const memberSchema = z.object({
  firstname: z.string().trim().min(1).max(120),
  lastname: z.string().trim().min(1).max(120),
  company: z.string().trim().min(1).max(160),
  email: z.string().email().optional().nullable(),
  phone: z.string().trim().min(3).max(32).optional().nullable(),
  consentShareContact: z.boolean().optional().default(true),
  consentShareHobbies: z.boolean().optional().default(true),
});

export const eventSchema = z.object({
  title: z.string().trim().min(2).max(160),
  type: z.string().trim().max(80).optional().nullable(),
  startAt: z.string().datetime(),
  location: z.string().trim().min(2).max(160),
  description: z.string().trim().min(4).max(2000),
  capacity: z.number().int().min(1).max(10000).optional().nullable(),
});
