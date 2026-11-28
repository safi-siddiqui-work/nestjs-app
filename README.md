# NestJS App

### Commands

- Help
  nest g -h

- Folder
  nest g mo --no-spec modules/todo
  nest g co --no-spec modules/todo
  nest g s --no-spec modules/todo

- Flat
  nest g mi --no-spec --flat middlewares/logger
  nest g f --no-spec --flat filters/http-exception
  nest g f --no-spec --flat filters/every-exception
  nest g pi --no-spec --flat pipes/zod-validation
  nest g gu --no-spec --flat guards/auth
  nest g d --no-spec --flat decorators/roles
  nest g itc --no-spec --flat interceptors/transform
  nest g cl --no-spec --flat config/app.config
  nest g pr --no-spec --flat providers/session-auth.provider

### Packages

- Install
  pnpm add -D prettier-plugin-organize-imports
  pnpm add zod
  pnpm add @nestjs/config
  pnpm add @nestjs/drizzle drizzle-orm@rc pg dotenv
  pnpm add -D drizzle-kit@rc @types/pg tsx
  pnpm add @nestjs/authentication
  pnpm add @nestjs/mail
  pnpm add @nestjs/outbox
  pnpm add @nestjs/passport passport @nestjs/jwt passport-jwt
  pnpm add -D @types/passport-jwt
  pnpm add @nestjs/throttler
