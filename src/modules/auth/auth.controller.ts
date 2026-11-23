import { CurrentUser, Public } from '@nestjs/authentication';
import { Body, Controller, Post } from '@nestjs/common';
import {
  signInSchema,
  type SignInSchemaType,
  signUpSchema,
  type SignUpSchemaType,
} from './auth.schema.js';
import { AuthService } from './auth.service.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('signup')
  signup(@Body({ schema: signUpSchema }) body: SignUpSchemaType) {
    return this?.authService?.signup(body);
  }

  @Public()
  @Post('signin')
  signin(@Body({ schema: signInSchema }) body: SignInSchemaType) {
    return this?.authService?.signin(body);
  }

  @Post('me')
  me(@CurrentUser() user: unknown) {
    return {
      user,
    };
    // return this?.authService?.signup();
  }
}
