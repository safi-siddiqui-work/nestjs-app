import { $ZodIssue } from 'zod/v4/core';
import { UserType } from '../databases/drizzle.database.js';

export type ApiResponseType = {
  success: boolean;
  data?: ApiResponseBodyType;
  error?: ErrorType;
};

export type ErrorType = {
  message?: string;
  issues?: $ZodIssue[];
  status?: number;
  path?: string;
  timestamp?: string;
};

export type ApiResponseBodyType = {
  user?: Partial<UserType>;
};
