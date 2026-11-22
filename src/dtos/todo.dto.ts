import { z } from 'zod';

// export class TodoFindAllDto {
//   name?: string;
// }

// export class TodoUpdateDto {
//   name?: string;
// }

export const createTodoSchema = z?.object({
  name: z.string().nonempty(),
});

export type CreateTodoDto = z.infer<typeof createTodoSchema>;

export const updateTodoParamSchema = z?.object({
  id: z.number().positive(),
});

export type UpdateTodoParamDto = z.infer<typeof updateTodoParamSchema>;
