import { z } from 'zod';

export const requestOtpSchema = z?.object({
  email: z.email(),
});

export type RequestOtpDto = z.infer<typeof requestOtpSchema>;

export const verifyOtpSchema = z?.object({
  code: z.string().min(6).max(6),
});

export type VerifyOtpDto = z.infer<typeof verifyOtpSchema>;

export const createUserSchema = z?.object({
  name: z.string().min(3).max(250),
  username: z.string().min(3).max(250),
  password: z.string().min(8).max(250),
});

export type CreateUserDto = z.infer<typeof createUserSchema>;
