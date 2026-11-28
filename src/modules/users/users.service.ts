import { PasswordHasher } from '@nestjs/authentication';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectDrizzle } from '@nestjs/drizzle';
import { Outbox } from '@nestjs/outbox';
import { ZodError } from 'zod';
import {
  usersTable,
  type DatabaseType,
} from '../../common/databases/drizzle.database.js';
import { ApiResponseBodyType } from '../../common/types/api-response-body.type.js';
import { Nullable } from '../../common/types/api-response.type.js';

@Injectable()
export class UsersService {
  constructor(
    @InjectDrizzle()
    private readonly db: DatabaseType,
    private readonly passwordHasher: PasswordHasher,
    private readonly outbox: Outbox,
  ) {}

  userDto(user: ApiResponseBodyType['user']): ApiResponseBodyType['user'] {
    const { email, name, username } = user ?? {};
    return {
      email,
      name,
      username,
    };
  }

  async emailMustBeUnique(body?: ApiResponseBodyType) {
    const { email } = body?.user ?? {};
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

  async usernameMustBeUnique(body?: ApiResponseBodyType) {
    const { username } = body?.user ?? {};
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
    const { topic } = body?.outbox ?? {};
    const { name, username, password, email } = body?.user ?? {};

    if (!name || !username || !password || !email || !topic) {
      throw new BadRequestException(
        'name, username, password, email, topic is required.',
      );
    }

    // create user
    const hashed = await this?.passwordHasher?.hash(password);
    let user: ApiResponseBodyType['user'][] = [];

    // outbox mail
    await this?.db?.transaction(async (tx) => {
      user = await tx
        ?.insert(usersTable)
        ?.values({
          email,
          name,
          username,
          password: hashed,
        })
        .returning({
          id: usersTable?.id,
          email: usersTable?.email,
          username: usersTable?.username,
          name: usersTable?.name,
        });

      await this?.outbox?.add(tx, [
        {
          topic,
          payload: {
            user: {
              email,
              name,
              username,
            },
          } satisfies ApiResponseBodyType,
        },
      ]);
    });

    this?.outbox?.notify();

    // if (this?.passwordHasher?.needsRehash(hashed)) {
    //   // upgrade old hashed passwords
    // }

    return {
      user: user?.at(0),
    };
  }

  async findUser(body?: ApiResponseBodyType): Promise<ApiResponseBodyType> {
    const { findFirst } = body?.user ?? {};
    // const {where} = body?.user?.findFirst ?? {}

    const user = await this?.db?.query?.usersTable?.findFirst({
      where: findFirst?.where
        ? {
            // email,
            ...(findFirst?.where?.email && { email: findFirst?.where?.email }),
          }
        : undefined,

      columns: findFirst?.columns
        ? {
            // id: true,
            ...(findFirst?.columns?.email && {
              email: findFirst?.columns?.email,
            }),
            ...(findFirst?.columns?.password && {
              password: findFirst?.columns?.password,
            }),
            ...(findFirst?.columns?.name && {
              name: findFirst?.columns?.name,
            }),
            ...(findFirst?.columns?.username && {
              username: findFirst?.columns?.username,
            }),
          }
        : undefined,
    });

    return {
      user,
    };
  }

  async comparePasswords(
    password?: Nullable<string>,
    hashed?: Nullable<string>,
  ): Promise<boolean> {
    return await this?.passwordHasher?.verify(password ?? 'A', hashed ?? 'B');
  }
}
