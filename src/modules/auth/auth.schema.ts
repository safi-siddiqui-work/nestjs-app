import { z } from 'zod';

export const signUpSchema = z.object({
  email: z.email().min(3).max(200),
  password: z.string().min(8).max(200),
});

export type SignUpSchemaType = z.infer<typeof signUpSchema>;

export const signInSchema = z.object({
  email: z.email().min(3).max(200),
  password: z.string().min(8).max(200),
});

export type SignInSchemaType = z.infer<typeof signInSchema>;
