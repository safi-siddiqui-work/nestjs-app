import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { User } from '../../common/decorators/user.decorator.js';
import { TodoFindAllDto } from '../../common/dto/todo.js';
import { AuthGuard } from '../../core/guards/auth.guard.js';
import {
  type CreateTodoDto,
  createTodoSchema,
  type UpdateTodoParamDto,
  updateTodoParamSchema,
} from './dto/index.js';
import { TodosService } from './todos.service.js';

@Controller('todos')
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @Get()
  getTodos(@Query() query: TodoFindAllDto) {
    return this.todosService?.getTodos();
  }

  @Post()
  @Roles(['admin'])
  @UseGuards(AuthGuard)
  create(
    @User() user: unknown,
    @Body({ schema: createTodoSchema }) body: CreateTodoDto,
  ) {
    // create(@Body(new ZodValidationPipe(createTodoSchema)) body: CreateTodoDto) {
    return this.todosService?.create();
  }

  @Put(':id')
  // update(@Param() params: { id: number }) {
  // update(@Param('id', ParseIntPipe) id: number) {
  // update(@Param({ schema: z.object({ id: z.number() }) }) id: number) {
  update(@Param({ schema: updateTodoParamSchema }) param: UpdateTodoParamDto) {
    return this.todosService?.update({
      id: param?.id,
    });
  }
}
