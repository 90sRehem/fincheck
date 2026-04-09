# @fincheck/api — Backend API

NestJS 11 backend with DDD architecture, Drizzle ORM, better-auth, and PostgreSQL.

## Stack

- **Framework:** NestJS 11 + Express
- **ORM:** Drizzle ORM + PostgreSQL 15
- **Auth:** better-auth + `@thallesp/nestjs-better-auth`
- **Validation:** Zod (env config, DTOs)
- **API Docs:** Swagger + Scalar (GET /docs)
- **Testing:** Vitest (unplugin-swc + vite-tsconfig-paths)

## Structure

```
src/
├── main.ts                              # Bootstrap: Express, CORS, Swagger, global prefix /api
├── app.module.ts                        # Root module
├── app.controller.ts                    # Health check: GET /api/health-check
├── core/                                # Infrastructure layer
│   ├── auth/                            # better-auth config, NestJS module/provider
│   ├── database/                        # Drizzle connection, schemas, migrations
│   │   ├── drizzle/
│   │   │   ├── schemas/                 # Auth schemas (users, sessions, accounts, verifications)
│   │   │   ├── schema-registry.ts       # Aggregates all schemas for relational queries
│   │   │   └── migrations/
│   │   ├── connection.ts                # Drizzle client factory
│   │   ├── database.module.ts           # @Global() Drizzle module
│   │   └── constants.ts                # DRIZZLE_DB symbol
│   └── env/                             # Zod-validated env via NestJS ConfigModule
├── modules/                             # Domain modules
│   └── {feature}/
│       ├── {feature}.module.ts          # NestJS module registration
│       ├── presentation/                # HTTP layer (controllers)
│       │   └── {use-case}.controller.ts
│       ├── application/                 # Application services (orchestration)
│       │   └── {use-case}/
│       │       ├── {use-case}.service.ts  # @Injectable wrapper
│       │       └── {use-case}.dto.ts       # Input validation
│       ├── domain/                      # Pure business logic (no NestJS deps)
│       │   ├── entities/
│       │   ├── value-objects/
│       │   ├── repositories/            # Abstract contracts (ports)
│       │   ├── validators/
│       │   └── use-cases/               # Pure domain use-cases
│       └── infra/                       # Infrastructure adapters
│           ├── mappers/                 # Domain <-> Persistence
│           └── drizzle/
│               └── schemas/            # Module-specific Drizzle schemas
└── shared/
    └── domain/                          # Domain kernel (Entity, ValueObject, Either, etc.)
```

## Layer Responsibilities

| Layer | Purpose | Dependencies |
|-------|---------|--------------|
| `presentation/` | HTTP: decorators, request parsing, response mapping | Application services |
| `application/` | Orchestration: @Injectable services that call domain use-cases | Domain use-cases |
| `domain/` | Pure logic: entities, value objects, use-cases | Shared domain kernel only |
| `infra/` | Persistence: Drizzle schemas, repositories, mappers | Domain entities |

## Key Conventions

### UseCase / Service Pattern

```typescript
// domain/use-cases/create-bank-account.use-case.ts
// Pure domain logic - NO @Injectable decorator
export class CreateBankAccountUseCase {
  constructor(private readonly repository: BankAccountRepository) {}
  
  async execute(input: CreateBankAccountInput): Promise<Either<ValidationError, BankAccount>> {
    // Business logic only
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

### Repository Pattern (Ports & Adapters)

- **Abstract repository** lives in `domain/repositories/` — the domain defines what it needs (port)
- **Concrete implementation** lives in `infra/drizzle/` — implements the contract (adapter)

```typescript
// domain/repositories/bank-account.repository.ts (abstract)
export abstract class BankAccountRepository {
  abstract create(bankAccount: BankAccount): Promise<BankAccount>;
  abstract findById(id: string, userId: string): Promise<BankAccount | null>;
  // ...
}

// infra/drizzle/drizzle-bank-account.repository.ts (concrete)
@Injectable()
export class DrizzleBankAccountRepository extends BankAccountRepository {
  constructor(@Inject(DRIZZLE_DB) private readonly db: DrizzleDB) {
    super();
  }
  // ...
}
```

### Auth

- **Global guard:** All routes protected by default via `AuthModule.forRoot()`
- **Public routes:** Use `@AllowAnonymous()` decorator
- **Optional auth:** Use `@OptionalAuth()`
- **Session access:** `@Session()` param decorator

### Database

- **DI injection:** `@Inject(DRIZZLE_DB) private readonly db: DrizzleDB`
- **Table naming:** Plural (`usePlural: true` in better-auth adapter)
- **ID strategy:** UUIDv4 as `text` (not native UUID)
- **Schema co-location:** Module-specific schemas in `modules/{module}/infra/drizzle/schemas/`
- **Schema registry:** `core/database/drizzle/schema-registry.ts` aggregates all schemas

### Drizzle Config

`drizzle.config.ts` uses dual glob pattern:

```typescript
dialect: "postgresql",
schema: "./src/core/database/drizzle/schemas/*",
out: "./src/core/database/drizzle/migrations/",
```

Plus a second glob for module schemas: `./src/modules/*/infra/drizzle/schemas/*`

### Modules

- **Global modules:** `EnvModule` and `DatabaseModule` are `@Global()` — inject directly
- **Barrel exports:** Always import from layer barrels, not deep paths
- **Module registration:** Each `{feature}.module.ts` imports and registers all layers

### Biome Override

- **`useImportType: off`** — NestJS DI requires runtime imports for injectable classes
- **File:** `apps/api/biome.json` overrides root config

## Adding a New Module

1. Create folder structure: `modules/{feature}/{layer}/...`
2. Define domain entity in `domain/entities/`
3. Define abstract repository in `domain/repositories/`
4. Write pure use-case in `domain/use-cases/` (no @Injectable)
5. Create @Injectable service wrapper in `application/{use-case}/`
6. Create DTO in `application/{use-case}/`
7. Create controller in `presentation/`
8. Implement Drizzle schema in `infra/drizzle/schemas/`
9. Implement concrete repository in `infra/drizzle/`
10. Create mapper in `infra/mappers/`
11. Register in `{feature}.module.ts`:
    - Controllers from presentation
    - Services from application
    - Repository binding (abstract -> concrete)
12. Add schema glob to `drizzle.config.ts`
13. Add schema to `schema-registry.ts`
14. Import module in `app.module.ts`

## Caveats

- **Test files STALE:** `app.controller.spec.ts` expects `"Hello World!"` but service returns `"healthy"`. E2E tests expect `/` but app uses `/api` prefix.
- **Schema registry:** Without proper schema registration, `db.query.*` relational API won't work — ensure schemas are added to registry and passed to `drizzle()`

For bounded contexts, module boundaries, event communication, and state isolation, load the `nestjs-modular-monolith` skill.
For schema changes, migrations, and Drizzle patterns, load the `fincheck-database` skill.