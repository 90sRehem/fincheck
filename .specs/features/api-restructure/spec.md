# API Module Restructure — Specification

**Status:** Approved  
**Scope:** Large (multi-file restructure + schema registry)  
**Affects:** `apps/api/`, `nestjs-ddd` skill, `apps/api/AGENTS.md`

---

## Goal

Migrate the `apps/api` backend from a flat use-case-folder pattern to a layered DDD module structure with clear separation of presentation, application, domain, and infrastructure concerns. Additionally, co-locate Drizzle schemas within modules and create a schema registry to enable relational queries.

---

## Context

The current structure mixes concerns: controllers, services, and DTOs live together in use-case folders at the module root. Drizzle schemas are centralized in `core/database/` even when they belong to a specific domain module. The Drizzle connection is initialized without schemas, preventing relational query API usage.

---

## Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Controller location | Dedicated `presentation/` folder | Clean separation of HTTP concerns from application logic |
| Application layer grouping | Use-case folders within `application/` | Keeps related service+DTO together, matches DDD application service pattern |
| Facades | Deferred (YAGNI) | No current cross-module orchestration need |
| Drizzle schemas | Co-located in module `infra/drizzle/schemas/` | Module owns its persistence; auth schemas stay in `core/` |
| Schema discovery | Dual glob in drizzle.config.ts | `core/` glob for auth + `modules/*/infra/drizzle/schemas/*` for domain |
| Schema registry | New `schema-registry.ts` passed to `drizzle()` | Enables `db.query.*` relational API |
| UseCase/Service | UseCase = pure logic in domain/, Service = @Injectable wrapper in application/ | Separates domain logic from NestJS DI concerns |
| Repository contract | Abstract repository in `domain/repositories/` | Domain layer owns the port, infra implements the adapter |

---

## Target Module Structure

```
modules/{feature}/
├── {feature}.module.ts                    # NestJS module, registers all layers
├── presentation/
│   └── {use-case}.controller.ts           # HTTP layer, delegates to application service
├── application/
│   └── {use-case}/
│       ├── {use-case}.service.ts          # @Injectable wrapper, calls domain use-case
│       └── {use-case}.dto.ts              # Input validation (Zod)
├── domain/
│   ├── entities/
│   │   └── {entity}.entity.ts             # Aggregate root or entity
│   ├── value-objects/
│   │   └── {vo}.ts
│   ├── repositories/
│   │   └── {entity}.repository.ts         # Abstract contract (port)
│   ├── {entity}.validator.ts             # Zod-based validation strategy
│   └── {use-case}.use-case.ts             # Pure domain logic, no NestJS decorators
└── infra/
    ├── mappers/
    │   └── {entity}.mapper.ts             # Domain <-> Persistence mapping
    └── drizzle/
        ├── schemas/
        │   └── {table}-schema.ts          # Drizzle table definition
        └── {entity}.drizzle-repository.ts # Concrete implementation (adapter)
```

### Layer Responsibilities

| Layer | Responsibility | Dependencies |
|-------|----------------|--------------|
| `presentation/` | HTTP concerns: decorators, request parsing, response mapping | Imports application services |
| `application/` | Orchestration: @Injectable service that calls domain use-case | Imports domain use-cases |
| `domain/` | Pure business logic: entities, value objects, use-cases | Only shared domain kernel (Either, Entity, etc.) |
| `infra/` | Persistence: Drizzle schemas, repositories, mappers | Imports domain entities/types |

---

## Schema Registry Design

```
core/database/
├── drizzle/
│   ├── schemas/
│   │   └── auth-schema.ts                 # Auth tables (users, sessions, accounts, verifications)
│   ├── schema-registry.ts                 # NEW: aggregates all schemas
│   ├── migrations/
│   ├── connection.ts                      # UPDATED: accepts schema from registry
│   └── database.module.ts
├── constants.ts
└── index.ts
```

The registry aggregates schemas from core + all modules:

```typescript
// core/database/drizzle/schema-registry.ts
import * as authSchema from "./schemas/auth-schema";
import * as bankAccountSchema from "../../../modules/bank-accounts/infra/drizzle/schemas/bank-account-schema";

export const schema = {
  ...authSchema,
  ...bankAccountSchema,
} as const;

// Type for use in drizzle connection
export type Schema = typeof schema;
```

The `DrizzleDB` type must be updated to include the schema type parameter so relational queries are type-safe:

```typescript
// Updated connection.ts
import { schema } from "./schema-registry";

export function createDrizzleConnection(pool: PgPool) {
  return drizzle(pool, { schema });
}
```

---

## Implementation Notes

### UseCase Pattern (Ports & Adapters)

```typescript
// domain/use-cases/create-bank-account.use-case.ts
export class CreateBankAccountUseCase {
  constructor(private readonly repository: BankAccountRepository) {}
  
  async execute(input: CreateBankAccountInput): Promise<Either<ValidationError, BankAccount>> {
    // Pure business logic, no @Injectable
  }
}

// application/services/create-bank-account.service.ts
@Injectable()
export class CreateBankAccountService {
  constructor(
    private readonly useCase: CreateBankAccountUseCase,
  ) {}
  
  async execute(input: CreateBankAccountInput & { userId: string }) {
    return this.useCase.execute(input);
  }
}
```

### Repository Injection in Domain UseCase

Since the abstract repository lives in `domain/repositories/`, the domain use-case can depend on the port without importing from infra:

```typescript
// domain/use-cases/create-bank-account.use-case.ts
import { BankAccountRepository } from "../repositories/bank-account.repository";

export class CreateBankAccountUseCase {
  constructor(private readonly repository: BankAccountRepository) {}
}
```

### Controller Delegates to Application Service

```typescript
// presentation/create-bank-account.controller.ts
@Controller("bank-accounts")
export class CreateBankAccountController {
  constructor(private readonly service: CreateBankAccountService) {}
  
  @Post()
  @HttpCode(201)
  async create(@Body() body: CreateBankAccountDTO, @Session() session: Session) {
    const result = await this.service.execute({ ...body, userId: session.userId });
    // ...
  }
}
```

---

## Out of Scope

- Creating new modules (users, session remain empty scaffolds)
- Changing business logic or API behavior
- Adding new tests
- Modifying shared/domain/ kernel

---

## Notes

- Controllers use `@Session()` to get authenticated userId (from better-auth)
- All routes are protected by default via global AuthModule guard
- Use `@AllowAnonymous()` for public routes
- Drizzle config glob must be updated to include module schemas: `./src/modules/*/infra/drizzle/schemas/*`