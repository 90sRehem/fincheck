---
name: nestjs-ddd
description: NestJS backend DDD patterns - module structure, use-case folders, core infrastructure (auth, database, env), entity/VO templates, Drizzle DI, better-auth integration, ports & adapters
---

# NestJS DDD Patterns

Backend domain-driven design patterns for Fincheck API (NestJS 11 + Express + Drizzle + better-auth).

## Module Structure

```
src/
├── core/                     # Infrastructure (auth, database, env)
│   ├── auth/                 # better-auth + NestJS
│   ├── database/            # Drizzle + PostgreSQL
│   │   └── drizzle/
│   │       ├── schemas/      # Auth tables (users, sessions, accounts, verifications)
│   │       ├── schema-registry.ts  # Aggregates all schemas
│   │       └── migrations/
│   └── env/                  # Zod validation
├── modules/                  # Domain modules
│   └── <context>/
│       ├── presentation/     # Controllers
│       ├── application/     # Services (use-case wrappers)
│       │   └── {use-case}/
│       │       ├── {use-case}.service.ts
│       │       └── {use-case}.dto.ts
│       ├── domain/          # Pure business logic
│       │   ├── entities/
│       │   ├── value-objects/
│       │   ├── repositories/ # Abstract contracts (ports)
│       │   ├── validators/
│       │   └── use-cases/    # Pure logic, no @Injectable
│       └── infra/            # Adapters
│           ├── mappers/
│           └── drizzle/
│               ├── schemas/  # Module-specific tables
│               └── {entity}.drizzle-repository.ts
└── shared/domain/            # Domain kernel (Entity, ValueObject, Either, etc.)
```

## Layer Responsibilities

| Layer | Purpose | Dependencies |
|-------|---------|--------------|
| `presentation/` | HTTP concerns: decorators, request parsing, response mapping | Application services |
| `application/` | Orchestration: @Injectable services that call domain use-cases | Domain use-cases |
| `domain/` | Pure business logic: entities, value objects, use-cases | Shared domain kernel only |
| `infra/` | Persistence: Drizzle schemas, repositories, mappers | Domain entities |

## Core Infrastructure

### Auth (better-auth)

- **Global guard:** All routes protected by default via `AuthModule.forRoot()`
- **Decorators:** `@AllowAnonymous()`, `@OptionalAuth()`, `@Session()`
- **Config:** Drizzle adapter (`usePlural: true`), email+password, UUIDv4 IDs
- **Tables:** users, sessions, accounts, verifications (in `core/database/drizzle/schemas/auth-schema.ts`)

**Static auth workaround:** `src/core/auth/auth.ts` uses `dotenv` directly (required by `AuthModule.forRoot()` at import time). Separate DI-based provider in `auth.provider.ts`.

### Database (Drizzle)

**DI pattern:**
```typescript
import { Inject } from "@nestjs/common";
import { DRIZZLE_DB } from "@/core/database/constants";
constructor(@Inject(DRIZZLE_DB) private readonly db: DrizzleDB) {}
```

**Schema registry:**
```typescript
// core/database/drizzle/schema-registry.ts
import * as authSchema from "./schemas/auth-schema";
import * as bankAccountSchema from "../../modules/bank-accounts/infra/drizzle/schemas/bank-account-schema";

export const schema = {
  ...authSchema,
  ...bankAccountSchema,
} as const;
```

**Connection with schema:**
```typescript
// core/database/connection.ts
import { schema } from "./schema-registry";
export function createDrizzleConnection(pool: PgPool) {
  return drizzle(pool, { schema });
}
```

**Conventions:**
- Plural table names (users, sessions)
- IDs: `text` (UUIDv4 strings, not native UUID)
- Schemas: `core/database/drizzle/schemas/` for auth, `modules/*/infra/drizzle/schemas/` for domain
- Migrations: `core/database/drizzle/migrations/`

**Workflow:** Modify schema → `bunx drizzle-kit generate` → review → `bunx drizzle-kit migrate`

### Env (Zod)

`EnvService.get("PORT")` — type-safe env access. `@Global()` module.

## UseCase / Service Pattern

```typescript
// domain/use-cases/create-bank-account.use-case.ts
// Pure domain logic - NO @Injectable decorator
export class CreateBankAccountUseCase {
  constructor(private readonly repository: BankAccountRepository) {}
  
  async execute(input: CreateBankAccountInput): Promise<Either<ValidationError, BankAccount>> {
    // Business logic only - no NestJS imports
  }
}

// application/services/create-bank-account.service.ts
// NestJS-injectable wrapper
@Injectable()
export class CreateBankAccountService {
  constructor(private readonly useCase: CreateBankAccountUseCase) {}
  
  async execute(input: CreateBankAccountInput & { userId: string }) {
    return this.useCase.execute(input);
  }
}
```

## Repository Pattern (Ports & Adapters)

**Abstract repository (port) lives in domain:**
```typescript
// domain/repositories/bank-account.repository.ts
export abstract class BankAccountRepository {
  abstract create(bankAccount: BankAccount): Promise<BankAccount>;
  abstract findById(id: string, userId: string): Promise<BankAccount | null>;
  abstract findAllByUserId(userId: string): Promise<BankAccount[]>;
  abstract update(bankAccount: BankAccount): Promise<BankAccount>;
  abstract delete(id: string, userId: string): Promise<void>;
}
```

**Concrete implementation (adapter) lives in infra:**
```typescript
// infra/drizzle/drizzle-bank-account.repository.ts
@Injectable()
export class DrizzleBankAccountRepository extends BankAccountRepository {
  constructor(@Inject(DRIZZLE_DB) private readonly db: DrizzleDB) {
    super();
  }
  
  async create(bankAccount: BankAccount): Promise<BankAccount> {
    // ...
  }
}
```

## Entity / Value Object Templates

**Entity:**
```typescript
export abstract class Entity<T> {
  protected readonly _id: string;
  protected props: T;
  protected constructor(props: T, id?: string) {
    this._id = id ?? crypto.randomUUID();
    this.props = props;
  }
  get id(): string { return this._id; }
}
```

**Aggregate Root:**
```typescript
export abstract class AggregateRoot<T> extends Entity<T> {
  private domainEvents: DomainEvent[] = [];
  
  addDomainEvent(event: DomainEvent): void {
    this.domainEvents.push(event);
  }
  
  pullDomainEvents(): DomainEvent[] {
    const events = [...this.domainEvents];
    this.domainEvents = [];
    return events;
  }
}
```

**Value Object:**
```typescript
export abstract class ValueObject<T> {
  protected readonly props: T;
  protected constructor(props: T) {
    this.props = Object.freeze(props);
  }
}
```

## NestJS Conventions

- **Global modules:** `EnvModule`, `DatabaseModule` — inject without importing
- **Barrel imports:** `import { X } from "@/core/env"` not `"@/core/env/env.service"`
- **Biome:** `useImportType: "off"` in `apps/api/biome.json` (decorators need runtime imports)
- **TS decorators:** `experimentalDecorators: true`, `emitDecoratorMetadata: true`

## Adding a New Module

1. **Create folder structure:**
   ```
   modules/{feature}/
   ├── {feature}.module.ts
   ├── presentation/
   ├── application/{use-case}/
   ├── domain/
   │   ├── entities/
   │   ├── value-objects/
   │   ├── repositories/
   │   └── use-cases/
   └── infra/
       ├── mappers/
       └── drizzle/schemas/
   ```

2. **Define domain entity** in `domain/entities/{entity}.entity.ts`

3. **Define abstract repository** in `domain/repositories/{entity}.repository.ts`

4. **Write pure use-case** in `domain/use-cases/{use-case}.use-case.ts` (no @Injectable)

5. **Create service wrapper** in `application/{use-case}/{use-case}.service.ts` (@Injectable)

6. **Create DTO** in `application/{use-case}/{use-case}.dto.ts`

7. **Create controller** in `presentation/{use-case}.controller.ts`

8. **Implement Drizzle schema** in `infra/drizzle/schemas/{table}-schema.ts`

9. **Implement concrete repository** in `infra/drizzle/{entity}.drizzle-repository.ts`

10. **Create mapper** in `infra/mappers/{entity}.mapper.ts`

11. **Register in module:**
    ```typescript
    // {feature}.module.ts
    @Module({
      controllers: [/* presentation controllers */],
      providers: [
        /* application services */
        /* repository binding: abstract -> concrete */
      ],
    })
    export class {Feature}Module {}
    ```

12. **Update drizzle.config.ts** to include module schema glob:
    ```typescript
    schema: [
      "./src/core/database/drizzle/schemas/*",
      "./src/modules/*/infra/drizzle/schemas/*",
    ]
    ```

13. **Update schema-registry.ts** to import and export the new schemas

14. **Import module** in `app.module.ts`

## Drizzle Config

`drizzle.config.ts` uses dual glob pattern:

```typescript
dialect: "postgresql",
schema: [
  "./src/core/database/drizzle/schemas/*",
  "./src/modules/*/infra/drizzle/schemas/*",
],
out: "./src/core/database/drizzle/migrations/",
```

## Caveats

- Express NOT Fastify (despite packages)
- `verbatimModuleSyntax: false` in node.json (required for NestJS)
- Schema registry must be updated when adding new modules — without it, relational queries (`db.query.*`) won't work
- All routes are protected by default — use `@AllowAnonymous()` for public routes