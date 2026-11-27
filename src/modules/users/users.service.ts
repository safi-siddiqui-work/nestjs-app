import { PasswordHasher } from '@nestjs/authentication';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectDrizzle } from '@nestjs/drizzle';
import { ZodError } from 'zod';
import {
  usersTable,
  type DatabaseType,
} from '../../common/databases/drizzle.database.js';
import { ApiResponseBodyType } from '../../common/types/api-response-body.type.js';

@Injectable()
export class UsersService {
  constructor(
    @InjectDrizzle()
    private readonly db: DatabaseType,
    private readonly passwordHasher: PasswordHasher,
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

  async usernameMustBeUnique(user: ApiResponseBodyType['user']) {
    const { username } = user ?? {};
    const userExist = await this?.db?.query?.usersTable?.findFirst({
      where: {
        username,
      },
      columns: {
        id: true,
      },
    });
    if (userExist) {
      throw new ZodError([
        {
          code: 'custom',
          path: ['username'],
          message: 'Username is already taken.',
        },
      ]);
    }
  }

  async createUserV1(body?: ApiResponseBodyType): Promise<ApiResponseBodyType> {
    const { name, username, password, email } = body?.user ?? {};

    if (!name || !username || !password || !email) {
      throw new BadRequestException(
        'name, username, password, email is required.',
      );
    }

    // create user
    const hashed = await this?.passwordHasher?.hash(password);
    const user = await this?.db
      ?.insert(usersTable)
      ?.values({
        email,
        name,
        username,
        password: hashed,
      })
      .returning({
        email: usersTable?.email,
        username: usersTable?.username,
        name: usersTable?.name,
      });

    // if (this?.passwordHasher?.needsRehash(hashed)) {
    //   // upgrade old hashed passwords
    // }

    return {
      user: user?.at(0),
    };
  }
}
