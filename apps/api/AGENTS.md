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

The service **extends** the use-case class. This is the standard pattern.

> **Rule**: Use-cases are NEVER registered as NestJS providers. The service IS the use-case via inheritance.

**Simple case** — service only adds `@Injectable()`:

```typescript
// domain/use-cases/get-user-balances.use-case.ts
// Pure domain logic - NO @Injectable
export class GetUserBalancesUseCase {
  constructor(private readonly balanceRepository: BalanceRepository) {}

  async execute(input: GetUserBalancesInput) {
    // Business logic
  }
}

// application/get-user-balances.service.ts
// Service IS the use-case via inheritance
@Injectable()
export class GetUserBalancesService extends GetUserBalancesUseCase {
  constructor(balanceRepository: BalanceRepository) {
    super(balanceRepository);
  }
}
```

**With orchestration** — service extends use-case AND adds extra deps (e.g., event dispatching):

```typescript
// application/create-bank-account.service.ts
@Injectable()
export class CreateBankAccountService extends CreateBankAccountUseCase {
  private readonly dispatcher: DomainEventDispatcher;

  constructor(
    bankAccountRepository: BankAccountRepository,
    dispatcher: DomainEventDispatcher,
  ) {
    super(bankAccountRepository);
    this.dispatcher = dispatcher;
  }

  override async execute(input: CreateBankAccountInput) {
    const result = await super.execute(input);

    if (result.isSuccess) {
      await this.dispatcher.dispatchAll(result.value);
    }

    return result;
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
5. Create @Injectable service that **extends** the use-case in `application/{use-case}/`
6. Create DTO in `application/{use-case}/`
7. Create controller in `presentation/`
8. Implement Drizzle schema in `infra/drizzle/schemas/`
9. Implement concrete repository in `infra/drizzle/`
10. Create mapper in `infra/mappers/`
11. Register in `{feature}.module.ts`:
    - Controllers from presentation
    - Services from application (the service IS the use-case via inheritance)
    - Repository binding (abstract → concrete)
    - **NOTE**: Use-cases are NOT registered as standalone providers
12. Add schema glob to `drizzle.config.ts`
13. Add schema to `schema-registry.ts`
14. Import module in `app.module.ts`

## API Versioning

### Strategy: URI Versioning

The API uses NestJS URI versioning with the format `/api/v{N}/...`. This enables safe evolution of the API without breaking existing clients.

**Configuration:**
- `enableVersioning({ type: VersioningType.URI, defaultVersion: "1" })` in `main.ts`
- All controllers without explicit version annotation respond on `/api/v1/`
- `AppController` marked with `VERSION_NEUTRAL` to serve `/api/health-check` (no version prefix)

**URL structure:**
```
GET /api/health-check           # VERSION_NEUTRAL
POST /api/auth/sign-in/email    # better-auth routes (no versioning)
GET /api/v1/bank-accounts       # Domain routes (v1)
GET /api/v1/transactions        # Domain routes (v1)
```

### Creating a v2 Endpoint

When a breaking change is needed:

1. Create new controller in `presentation/v2/`:
```typescript
// modules/transactions/presentation/v2/transactions.controller.ts
@Controller({ path: "transactions", version: "2" })
export class TransactionsControllerV2 {
  // New implementation with different contract
}
```

2. Register both v1 and v2 in the module:
```typescript
@Module({
  controllers: [TransactionsController, TransactionsControllerV2],
  // ...
})
```

3. Update Swagger docs to show both versions if needed.

### Deprecation Headers

For versions being sunset, add deprecation headers:

```typescript
@Controller({ path: "transactions", version: "1" })
export class TransactionsController {
  @Get()
  @Header("Deprecation", "true")
  @Header("Sunset", "2027-01-01T00:00:00Z")
  @Header("Link", '</api/v2/transactions>; rel="successor-version"')
  list() { ... }
}
```

**Lifecycle:**
- **Active version:** Receives features and bug fixes
- **Deprecated version:** Only critical bug fixes, deprecation headers added
- **Sunset version:** Removed after announced date (minimum 3 months notice)

## Caveats

- **Test files STALE:** `app.controller.spec.ts` expects `"Hello World!"` but service returns `"healthy"`. E2E tests expect `/` but app uses `/api` prefix.
- **Schema registry:** Without proper schema registration, `db.query.*` relational API won't work — ensure schemas are added to registry and passed to `drizzle()`

For bounded contexts, module boundaries, event communication, and state isolation, load the `nestjs-modular-monolith` skill.
For schema changes, migrations, and Drizzle patterns, load the `fincheck-database` skill.