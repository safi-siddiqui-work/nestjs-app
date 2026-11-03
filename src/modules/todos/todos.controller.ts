import { Controller, Get, Param, Post, Put } from '@nestjs/common';
import { TodosService } from './todos.service.js';

@Controller('todos')
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @Get()
  getTodos() {
    return this.todosService?.getTodos();
  }

  @Post()
  create() {
    return this.todosService?.create();
  }

  @Put(':id')
  update(@Param() params: { id: number }) {
    return this.todosService?.update({
      id: params?.id,
    });
  }
}
