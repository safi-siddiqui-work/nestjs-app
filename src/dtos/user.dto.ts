import { ApiResponseBodyType } from '../types/api-response-body.type.js';

export class UserDto {
  constructor(private readonly user: ApiResponseBodyType['user']) {}
  secure(): ApiResponseBodyType['user'] {
    return {
      ...this?.user,
    };
  }
}
