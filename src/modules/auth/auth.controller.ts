import { Public } from '@nestjs/authentication';
import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import {
  signInSchema,
  type SignInSchemaType,
  signUpSchema,
  type SignUpSchemaType,
} from './auth.schema.js';

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
  me() {
    // return this?.authService?.signup();
  }
}
