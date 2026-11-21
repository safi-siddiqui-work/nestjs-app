import { Injectable } from '@nestjs/common';
import { InjectDrizzle } from '@nestjs/drizzle';
import { type DatabaseType, todosTable } from '../../database/schema.js';
import { CreateTodoDto } from './dto/index.js';

@Injectable()
export class TodosService {
  constructor(
    @InjectDrizzle()
    private readonly db: DatabaseType,
  ) {}

  async getTodos() {
    // const todos = await this?.db?.select().from(todosTable);
    const todos = await this?.db?.query?.todosTable?.findMany();
    return {
      todos,
    };
  }

  async create(body: CreateTodoDto) {
    const todos = await this?.db
      ?.insert(todosTable)
      ?.values({
        name: body?.name,
      })
      .returning();
    return {
      todos: todos?.at(0),
    };
  }

  update(params: { id: number }) {
    return [
      {
        name: `Todo ${params?.id}`,
      },
    ];
  }
}
