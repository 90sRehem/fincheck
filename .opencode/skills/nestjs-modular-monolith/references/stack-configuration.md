# Stack Configuration

Fincheck-specific configuration patterns for the modular monolith.

## Bootstrap (main.ts)

```typescript
// src/main.ts — Current Fincheck bootstrap
import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.setGlobalPrefix("api");
  app.disable("x-powered-by");
  app.enableCors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
  });

  // Swagger + Scalar
  const config = new DocumentBuilder()
    .setTitle("Fincheck API")
    .setVersion("1.0")
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("docs", app, document);

  await app.listen(process.env.PORT || 3333);
}
bootstrap();
```

## Drizzle Database Setup

### Connection (core/database)

```typescript
// src/core/database/connection.ts
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as authSchema from "./drizzle/schemas/auth-schema";
// Import module schemas as they're created
// import * as transactionsSchema from "./drizzle/schemas/transactions-schema";

export function createDrizzleConnection(url: string) {
  const pool = new Pool({ connectionString: url });
  return drizzle(pool, {
    schema: {
      ...authSchema,
      // ...transactionsSchema,
    },
  });
}

export type DrizzleDB = ReturnType<typeof createDrizzleConnection>;
```

### DI Token

```typescript
// src/core/database/constants.ts
export const DRIZZLE_DB = Symbol("DRIZZLE_DB");
```

### Module Registration

```typescript
// src/core/database/database.module.ts
@Global()
@Module({
  providers: [
    {
      provide: DRIZZLE_DB,
      inject: [EnvService],
      useFactory: (env: EnvService) => {
        return createDrizzleConnection(env.get("DATABASE_URL"));
      },
    },
  ],
  exports: [DRIZZLE_DB],
})
export class DatabaseModule {}
```

### Adding Module Schemas

When creating a new module with its own tables:

1. Create schema file:
```typescript
// src/core/database/drizzle/schemas/transactions-schema.ts
import { pgTable, text, integer, timestamp } from "drizzle-orm/pg-core";
import { users } from "./auth-schema";

export const transactions = pgTable("transactions", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => users.id),
  // ... columns
});
```

2. Register in connection:
```typescript
// src/core/database/connection.ts
import * as transactionsSchema from "./drizzle/schemas/transactions-schema";

export function createDrizzleConnection(url: string) {
  const pool = new Pool({ connectionString: url });
  return drizzle(pool, {
    schema: { ...authSchema, ...transactionsSchema },
  });
}
```

3. Generate and run migration:
```bash
bun run --filter @fincheck/api db:generate
bun run --filter @fincheck/api db:migrate
```

## Drizzle Config

```typescript
// drizzle.config.ts
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/core/database/drizzle/schemas/*",
  out: "./src/core/database/drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

## Environment Variables

### Schema

```typescript
// src/core/env/env.schema.ts
import { z } from "zod";

export const envSchema = z.object({
  PORT: z.coerce.number().default(3333),
  DATABASE_URL: z.string().url(),
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.string().url(),
  // Add new env vars here as modules need them
});

export type Env = z.infer<typeof envSchema>;
```

### Usage

```typescript
// In any service (EnvModule is @Global)
constructor(private readonly env: EnvService) {}

someMethod() {
  const port = this.env.get("PORT"); // Type-safe
}
```

## Biome Configuration

```json
// apps/api/biome.json — overrides root config
{
  "extends": ["../../biome.json"],
  "linter": {
    "rules": {
      "style": {
        "useImportType": "off"  // NestJS DI needs runtime imports
      }
    }
  }
}
```

## DTO Patterns with Zod

Fincheck uses Zod (not class-validator) for DTOs:

```typescript
// src/modules/transactions/create-transaction/create-transaction.dto.ts
import { z } from "zod";
import { createZodDto } from "@anatine/zod-nestjs";

export const createTransactionSchema = z.object({
  description: z.string().min(1).max(255),
  amountInCents: z.number().int().positive(),
  type: z.enum(["income", "expense"]),
  categoryId: z.string().uuid().optional(),
  date: z.coerce.date(),
});

export class CreateTransactionDto extends createZodDto(createTransactionSchema) {}

// Or without the Zod-NestJS bridge:
export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
```

## Swagger Decorators

```typescript
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

@ApiTags("Transactions")
@Controller("transactions")
export class CreateTransactionController {
  @Post()
  @ApiOperation({ summary: "Create a new transaction" })
  @ApiResponse({ status: 201, description: "Transaction created successfully" })
  @ApiResponse({ status: 400, description: "Invalid input" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async handle(@Body() dto: CreateTransactionDto, @Session() session: UserSession) {
    return this.service.execute({ ...dto, userId: session.userId });
  }
}
```

## Exception Handling

Domain-specific exceptions for clean error responses:

```typescript
// src/shared/domain/exceptions/domain.exception.ts
export class DomainException extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 400,
  ) {
    super(message);
  }
}

// src/modules/transactions/domain/exceptions/transaction-not-found.exception.ts
export class TransactionNotFoundException extends DomainException {
  constructor(id: string) {
    super(`Transaction ${id} not found`, "TRANSACTION_NOT_FOUND", 404);
  }
}
```

Global exception filter:
```typescript
// src/shared/filters/domain-exception.filter.ts
@Catch(DomainException)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: DomainException, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse();
    response.status(exception.statusCode).json({
      error: exception.code,
      message: exception.message,
      statusCode: exception.statusCode,
    });
  }
}
```
