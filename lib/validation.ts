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
