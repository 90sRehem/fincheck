# Authentication

better-auth integration patterns for the modular monolith.

## Current Setup

Fincheck uses `better-auth` with `@thallesp/nestjs-better-auth` NestJS integration.

**Key files:**
- `src/core/auth/auth.config.ts` — better-auth factory config
- `src/core/auth/auth.ts` — Static instance (dotenv, for `forRoot()`)
- `src/core/auth/auth.provider.ts` — DI-managed `"BETTER_AUTH"` token
- `src/core/auth/auth.module.ts` — `BetterAuthModule.forRoot({ auth })`

**Auth tables (owned by `core/auth`):**
- `users` — id, name, email, emailVerified, image, timestamps
- `sessions` — id, token, expiresAt, userId, IP, UA, timestamps
- `accounts` — id, accountId, providerId, userId, password, timestamps
- `verifications` — id, identifier, value, expiresAt, timestamps

## Global Guard

All routes are protected by default via `AuthModule.forRoot()`.

### Public Routes

```typescript
import { AllowAnonymous } from "@thallesp/nestjs-better-auth";

@Controller("health")
export class HealthController {
  @Get()
  @AllowAnonymous()
  check() {
    return { status: "healthy" };
  }
}
```

### Optional Auth

```typescript
import { OptionalAuth } from "@thallesp/nestjs-better-auth";

@Controller("products")
export class ProductsController {
  @Get()
  @OptionalAuth()
  list(@Session() session?: UserSession) {
    // session is undefined for anonymous users
    if (session) {
      return this.service.listForUser(session.userId);
    }
    return this.service.listPublic();
  }
}
```

### Session Access

```typescript
import { Session } from "@thallesp/nestjs-better-auth";

@Controller("transactions")
export class TransactionsController {
  @Post()
  create(@Body() dto: CreateTransactionDto, @Session() session: UserSession) {
    return this.service.execute({ ...dto, userId: session.userId });
  }
}
```

## Module-Level Auth Patterns

### User Context in Services

Pass `userId` from the session through DTOs — don't inject the session into services:

```typescript
// GOOD — Clean separation
@Controller("transactions")
export class CreateTransactionController {
  @Post()
  handle(@Body() dto: CreateTransactionDto, @Session() session: UserSession) {
    return this.service.execute({ ...dto, userId: session.userId });
  }
}

// BAD — Service depends on HTTP context
@Injectable()
export class CreateTransactionService {
  execute(@Session() session: UserSession) { // Don't do this
    // ...
  }
}
```

### Module-Specific Auth (Future)

When modules need role-based access:

```typescript
// src/shared/domain/types/roles.ts
export type UserRole = "admin" | "user" | "premium";

// Custom guard for module-level authorization
@Injectable()
export class PremiumGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const session = context.switchToHttp().getRequest().session;
    return session?.user?.role === "premium";
  }
}

// Usage
@Controller("billing")
@UseGuards(PremiumGuard)
export class BillingController { ... }
```

## Auth in Event Handlers

Event handlers run outside HTTP context — they don't have sessions:

```typescript
// Event carries the userId explicitly
@OnEvent("transaction.created")
async handle(event: TransactionCreatedEvent) {
  // event.userId is available — no session needed
  await this.balanceService.recalculate(event.userId);
}
```

## Testing with Auth

### Mocking Auth in Unit Tests

```typescript
// Skip auth in unit tests — test the service directly
const service = new CreateTransactionService(mockRepo, mockEmitter);
await service.execute({ userId: "test-user", ...dto });
```

### E2E Tests with Auth

```typescript
// test/helpers/auth.helper.ts
export async function createTestSession(app: INestApplication): Promise<string> {
  const response = await request(app.getHttpServer())
    .post("/api/auth/sign-up/email")
    .send({
      email: `test-${Date.now()}@example.com`,
      password: "TestPassword123!",
      name: "Test User",
    });

  return response.headers["set-cookie"][0]; // Session cookie
}

// In E2E test
const cookie = await createTestSession(app);
await request(app.getHttpServer())
  .post("/api/transactions")
  .set("Cookie", cookie)
  .send(transactionDto)
  .expect(201);
```
