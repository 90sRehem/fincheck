# Architecture Patterns

Clean Architecture layers and DDD patterns adapted for Fincheck's NestJS + Drizzle stack.

## Clean Architecture Layers

Each module follows four layers with strict dependency direction (outer → inner):

```
Presentation → Application → Domain ← Infrastructure
```

### Domain Layer (innermost)

Pure business logic. No framework dependencies.

**Location:** `src/shared/domain/` (shared kernel) + `src/modules/<context>/domain/` (module-specific)

**Contains:**
- Entity base class
- Value objects
- Domain events
- Repository interfaces (ports)
- Domain exceptions

```typescript
// src/shared/domain/entities/entity.ts
export abstract class Entity<T> {
  protected readonly _id: string;
  protected props: T;

  protected constructor(props: T, id?: string) {
    this._id = id ?? crypto.randomUUID();
    this.props = props;
  }

  get id(): string {
    return this._id;
  }

  equals(entity: Entity<T>): boolean {
    return this._id === entity._id;
  }
}

// src/shared/domain/value-objects/value-object.ts
export abstract class ValueObject<T> {
  protected readonly props: T;

  protected constructor(props: T) {
    this.props = Object.freeze(props);
  }

  equals(vo: ValueObject<T>): boolean {
    return JSON.stringify(this.props) === JSON.stringify(vo.props);
  }
}
```

**Repository interface pattern:**
```typescript
// src/modules/billing/domain/billing-plan.repository.ts
export abstract class BillingPlanRepository {
  abstract findById(id: string): Promise<BillingPlan | null>;
  abstract findByUserId(userId: string): Promise<BillingPlan[]>;
  abstract save(plan: BillingPlan): Promise<void>;
  abstract delete(id: string): Promise<void>;
}
```

### Application Layer

Orchestrates domain objects. Use-case focused.

**Location:** `src/modules/<context>/<use-case>/`

**Default (simple services):**
```typescript
// src/modules/billing/create-plan/create-plan.service.ts
@Injectable()
export class CreatePlanService {
  constructor(
    private readonly planRepo: BillingPlanRepository,
    @Inject(DRIZZLE_DB) private readonly db: DrizzleDB,
  ) {}

  async execute(dto: CreatePlanDto): Promise<BillingPlan> {
    const plan = BillingPlan.create(dto);
    await this.planRepo.save(plan);
    return plan;
  }
}
```

**CQRS (when domain warrants it):**
```typescript
// src/modules/reporting/generate-report/generate-report.query.ts
export class GenerateReportQuery {
  constructor(
    public readonly userId: string,
    public readonly dateRange: DateRange,
  ) {}
}

// src/modules/reporting/generate-report/generate-report.handler.ts
@QueryHandler(GenerateReportQuery)
export class GenerateReportHandler implements IQueryHandler<GenerateReportQuery> {
  constructor(
    @Inject(DRIZZLE_DB) private readonly db: DrizzleDB,
  ) {}

  async execute(query: GenerateReportQuery) {
    // Read-optimized query, possibly different from write model
  }
}
```

### Infrastructure Layer

Implements domain interfaces with concrete technology.

**Location:** `src/modules/<context>/infra/`

```typescript
// src/modules/billing/infra/persistence/drizzle-billing-plan.repository.ts
@Injectable()
export class DrizzleBillingPlanRepository extends BillingPlanRepository {
  constructor(
    @Inject(DRIZZLE_DB) private readonly db: DrizzleDB,
  ) {
    super();
  }

  async findById(id: string): Promise<BillingPlan | null> {
    const row = await this.db.query.billingPlans.findFirst({
      where: eq(billingPlans.id, id),
    });
    if (!row) return null;
    return BillingPlanMapper.toDomain(row);
  }

  async save(plan: BillingPlan): Promise<void> {
    const data = BillingPlanMapper.toPersistence(plan);
    await this.db.insert(billingPlans).values(data).onConflictDoUpdate({
      target: billingPlans.id,
      set: data,
    });
  }
}
```

**Mapper pattern:**
```typescript
// src/modules/billing/infra/mappers/billing-plan.mapper.ts
export class BillingPlanMapper {
  static toDomain(raw: typeof billingPlans.$inferSelect): BillingPlan {
    return new BillingPlan(
      { name: raw.name, price: Money.create(raw.priceInCents) },
      raw.id,
    );
  }

  static toPersistence(plan: BillingPlan): typeof billingPlans.$inferInsert {
    return {
      id: plan.id,
      name: plan.name,
      priceInCents: plan.price.toCents(),
    };
  }
}
```

### Presentation Layer

HTTP controllers with Swagger docs.

**Location:** Co-located in use-case folder.

```typescript
// src/modules/billing/create-plan/create-plan.controller.ts
@Controller("billing/plans")
export class CreatePlanController {
  constructor(private readonly createPlanService: CreatePlanService) {}

  @Post()
  @ApiOperation({ summary: "Create a billing plan" })
  @ApiResponse({ status: 201, description: "Plan created" })
  async handle(@Body() dto: CreatePlanDto, @Session() session: UserSession) {
    return this.createPlanService.execute({ ...dto, userId: session.userId });
  }
}
```

## Module Definition Pattern

```typescript
// src/modules/billing/billing.module.ts
@Module({
  imports: [], // No need for EnvModule/DatabaseModule (they're global)
  controllers: [
    CreatePlanController,
    GetPlanController,
    ListPlansController,
  ],
  providers: [
    CreatePlanService,
    GetPlanService,
    ListPlansService,
    // Bind abstract repository to concrete implementation
    {
      provide: BillingPlanRepository,
      useClass: DrizzleBillingPlanRepository,
    },
  ],
  exports: [
    // ONLY export what other modules need
    // Prefer events over direct service exports
    BillingPlanRepository, // Only if other modules need read access
  ],
})
export class BillingModule {}
```

**Register in AppModule:**
```typescript
// src/app.module.ts
@Module({
  imports: [
    ConfigModule.forRoot({ validate: envSchema.parse }),
    EnvModule,
    DatabaseModule,
    AuthModule,
    // Domain modules
    BillingModule,
    TransactionsModule,
  ],
})
export class AppModule {}
```

## When to Use CQRS

Use CQRS **only** when:
- Read and write models are fundamentally different
- Complex reporting/analytics queries that don't map to entities
- High read-to-write ratio with different optimization needs
- Event-sourced aggregates (rare for Fincheck)

**Default to simple services** for standard CRUD operations.

## Drizzle Schema per Module

Each module owns its tables. Co-locate or centralize based on preference:

**Option A — Centralized (current Fincheck pattern):**
```
src/core/database/drizzle/schemas/
├── auth-schema.ts        # users, sessions, accounts, verifications
├── billing-schema.ts     # billing_plans, subscriptions
└── transactions-schema.ts # transactions, categories
```

**Option B — Co-located per module:**
```
src/modules/billing/infra/persistence/billing.schema.ts
src/modules/transactions/infra/persistence/transactions.schema.ts
```

Both work with Drizzle. Option A is simpler for migrations; Option B enforces ownership.
