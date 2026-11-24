import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard.js';
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

  @Post('signup')
  signup(@Body({ schema: signUpSchema }) body: SignUpSchemaType) {
    return this?.authService?.signup(body);
  }

  // @UseGuards(LocalAuthGuard)
  @Post('signin')
  signin(
    @Body({ schema: signInSchema }) body: SignInSchemaType,
    @Req() req: any,
  ) {
    return this?.authService?.signin(body);
  }

  @UseGuards(JwtAuthGuard)
  @Post('me')
  me(@Req() req: any) {
    return {
      user: req.user,
    };

    // return this?.authService?.signup();
  }
}
