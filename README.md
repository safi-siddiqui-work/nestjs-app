# NestJS App

### Structure
src/
├── core/                    # App-wide infrastructure & global singletons
│   ├── database/            # Database connection, migrations, seeding
│   ├── guards/              # Auth, Roles, or Throttler guards
│   ├── interceptors/        # Logging, serialization, caching interceptors
│   └── middlewares/         # Global Express/Fastify middlewares
│
├── common/                  # Generic, completely reusable utilities (domain-agnostic)
│   ├── decorators/          # Custom decorators (e.g., @CurrentUser)
│   ├── dto/                 # Global DTOs (e.g., PaginationQueryDto)
│   ├── filters/             # All exception filters (e.g., HttpExceptionFilter)
│   ├── pipes/               # Custom validation or transformation pipes
│   └── utils/               # Pure helper functions (dates, string parsing)
│
├── config/                  # App configuration and environment variable loading
│   ├── app.config.ts
│   ├── database.config.ts
│   └── index.ts
│
├── integrations/            # Wrappers for external/third-party services
│   ├── aws/                 # AWS S3, SES, SQS handlers
│   ├── stripe/              # Payment gateway integrations
│   └── mail/                # Email client setup
│
├── modules/                 # Feature-driven domain modules (the core business logic)
│   ├── users/               # Example: User Management Domain
│   │   ├── dto/             # Request validation shapes specific to users
│   │   ├── entities/        # Database models/schemas for users
│   │   ├── interfaces/      # TypeScript interfaces or enums
│   │   ├── users.controller.ts
│   │   ├── users.module.ts
│   │   ├── users.service.ts
│   │   └── users.controller.spec.ts
│   └── auth/                # Example: Authentication Domain
│
├── app.module.ts            # Root module bootstrapping the application
└── main.ts                  # Entry point file of the application

### Packages

- Formatting, Linting, Organizing 
pnpm add -D prettier-plugin-organize-imports

- Validation
pnpm add zod

### Commands

- Help
nest g -h

- Folder
nest g mo --no-spec modules/todo
nest g co --no-spec modules/todo
nest g s --no-spec modules/todo

- Flat
nest g mi --no-spec --flat core/middlewares/logger
nest g f --no-spec --flat common/filters/http-exception
nest g f --no-spec --flat common/filters/every-exception
nest g pi --no-spec --flat common/pipes/zod-validation
nest g gu --no-spec --flat core/guards/auth
nest g d --no-spec --flat common/decorators/roles


