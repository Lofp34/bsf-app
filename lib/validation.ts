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
  acceptTerms: z.literal(true),
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

export const eventCreateSchema = eventSchema.extend({
  audience: z.enum(["PUBLIC", "SELECTED"]),
  inviteAll: z.boolean().optional().default(false),
  inviteMemberIds: z.array(z.string()).optional().default([]),
});

export const recommendationSchema = z.object({
  recipientMemberId: z.string(),
  recContactFirstname: z.string().trim().min(1).max(120),
  recContactLastname: z.string().trim().min(1).max(120),
  recContactCompany: z.string().trim().max(160).optional().nullable(),
  recContactEmail: z.string().email().optional().nullable(),
  recContactPhone: z.string().trim().min(3).max(32).optional().nullable(),
  text: z.string().trim().min(10).max(4000),
});

export const recommendationStatusSchema = z.object({
  status: z.enum(["SENT", "IN_PROGRESS", "VALIDATED", "ABANDONED"]),
  revenueAmount: z.number().min(0).optional().nullable(),
  revenueCurrency: z.string().trim().max(8).optional().nullable(),
});
