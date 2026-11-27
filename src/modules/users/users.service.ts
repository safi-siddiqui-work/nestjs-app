import { Injectable } from '@nestjs/common';
import { InjectDrizzle } from '@nestjs/drizzle';
import { ZodError } from 'zod';
import { type DatabaseType } from '../../common/databases/drizzle.database.js';
import { ApiResponseBodyType } from '../../common/types/api-response-body.type.js';

@Injectable()
export class UsersService {
  constructor(
    @InjectDrizzle()
    private readonly db: DatabaseType,
  ) {}

  async emailMustBeUnique(user: ApiResponseBodyType['user']) {
    const { email } = user ?? {};
    const userExist = await this?.db?.query?.usersTable?.findFirst({
      where: {
        email,
      },
      columns: {
        id: true,
      },
    });
    if (userExist) {
      throw new ZodError([
        {
          code: 'custom',
          path: ['email'],
          message: 'Email is already taken.',
        },
      ]);
    }
  }
}
