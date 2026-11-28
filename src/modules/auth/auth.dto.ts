import { z } from 'zod';

export const requestOtpSchema = z?.object({
  email: z.email(),
});

export type RequestOtpDto = z.infer<typeof requestOtpSchema>;

export const verifyOtpSchema = z?.object({
  code: z.string().min(8).max(8),
});

export type VerifyOtpDto = z.infer<typeof verifyOtpSchema>;

export const createUserV1Schema = z?.object({
  name: z.string().min(3).max(250),
  username: z.string().min(3).max(250),
  password: z.string().min(8).max(250),
});

export type CreateUserV1Dto = z.infer<typeof createUserV1Schema>;

export const emailPasswordSchema = z?.object({
  email: z.email(),
  password: z.string().min(8).max(250),
});

export type EmailPasswordDto = z.infer<typeof emailPasswordSchema>;
