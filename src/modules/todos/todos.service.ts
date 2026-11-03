import { Injectable } from '@nestjs/common';

@Injectable()
export class TodosService {
  getTodos() {
    return [
      {
        name: 'Todo1',
      },
    ];
  }

  create() {
    return [
      {
        name: 'Todo1',
      },
    ];
  }

  update(params: { id: number }) {
    return [
      {
        name: `Todo ${params?.id}`,
      },
    ];
  }
}
