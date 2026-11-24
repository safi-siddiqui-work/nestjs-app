import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../../decorators/roles.decorator.js';
import { User } from '../../decorators/user.decorator.js';
import { type CreateTodoDto, createTodoSchema } from '../../dtos/todo.dto.js';
import { AuthGuard } from '../../guards/auth.guard.js';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard.js';
import { TodosService } from './todos.service.js';

@Controller('todos')
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @Get()
  getTodos(@Query() query: unknown) {
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
    return this.todosService?.create(body);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  // update(@Param() params: { id: number }) {
  // update(@Param('id', ParseIntPipe) id: number) {
  // update(@Param({ schema: z.object({ id: z.number() }) }) id: number) {
  update(
    @Req() req: any,
    // @Param({ schema: updateTodoParamSchema }) param: UpdateTodoParamDto,
  ) {
    return this.todosService?.update({
      id: 0,
      // id: param?.id,
    });
  }
}
