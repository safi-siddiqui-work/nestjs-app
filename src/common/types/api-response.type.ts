import { $ZodIssue } from 'zod/v4/core';
import { type ApiResponseBodyType } from './api-response-body.type.js';

export type Nullable<T> = T | null;

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
