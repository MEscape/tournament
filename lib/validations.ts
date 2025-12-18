import { z } from "zod"

export const accessCodeSchema = z.object({
  code: z.string().uuid("Invalid access code format"),
})

export const usernameSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be at most 20 characters")
    .regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, underscores and hyphens"),
})

export const registrationSchema = z.object({
  accessCode: z.string().uuid("Invalid access code"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be at most 20 characters")
    .regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, underscores and hyphens"),
  imageUrl: z.string().url("Invalid image URL"),
})

export const revokeCodeSchema = z.object({
  codeId: z.string().cuid("Invalid code ID"),
})

