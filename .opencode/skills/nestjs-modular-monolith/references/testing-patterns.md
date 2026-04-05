# Testing Patterns

Vitest-based testing strategies for modular monolith modules.

## Test Structure

```
src/modules/<context>/
├── <use-case>/
│   ├── <use-case>.service.ts
│   ├── <use-case>.service.spec.ts     # Unit test
│   └── <use-case>.controller.spec.ts  # Controller test (optional)
├── infra/
│   └── persistence/
│       └── drizzle-<entity>.repository.spec.ts  # Integration test
└── __tests__/
    └── <context>.integration.spec.ts  # Module-level integration
```

## Unit Tests (Use-Case Services)

Test business logic in isolation. Mock repositories and external dependencies.

```typescript
// src/modules/transactions/create-transaction/create-transaction.service.spec.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { CreateTransactionService } from "./create-transaction.service";
import { TransactionRepository } from "../domain/transaction.repository";
import { EventEmitter2 } from "@nestjs/event-emitter";

describe("CreateTransactionService", () => {
  let service: CreateTransactionService;
  let mockRepo: TransactionRepository;
  let mockEmitter: EventEmitter2;

  beforeEach(() => {
    mockRepo = {
      save: vi.fn().mockResolvedValue(undefined),
      findById: vi.fn(),
      findByUserId: vi.fn(),
      delete: vi.fn(),
    } as unknown as TransactionRepository;

    mockEmitter = {
      emit: vi.fn(),
    } as unknown as EventEmitter2;

    service = new CreateTransactionService(mockRepo, mockEmitter);
  });

  it("should create a transaction and emit event", async () => {
    const dto = {
      userId: "user-123",
      description: "Groceries",
      amountInCents: 5000,
      type: "expense" as const,
      categoryId: "cat-1",
      date: new Date(),
    };

    const result = await service.execute(dto);

    expect(result.id).toBeDefined();
    expect(mockRepo.save).toHaveBeenCalledOnce();
    expect(mockEmitter.emit).toHaveBeenCalledWith(
      "transaction.created",
      expect.objectContaining({ userId: "user-123" }),
    );
  });

  it("should reject negative amounts", async () => {
    const dto = {
      userId: "user-123",
      description: "Invalid",
      amountInCents: -100,
      type: "expense" as const,
      categoryId: "cat-1",
      date: new Date(),
    };

    await expect(service.execute(dto)).rejects.toThrow("Amount must be positive");
  });
});
```

## Integration Tests (Repository)

Test Drizzle repositories against a real (test) database.

```typescript
// src/modules/transactions/infra/persistence/drizzle-transaction.repository.spec.ts
import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { DrizzleTransactionRepository } from "./drizzle-transaction.repository";
import * as schema from "@/core/database/drizzle/schemas/transactions-schema";

describe("DrizzleTransactionRepository", () => {
  let pool: Pool;
  let db: ReturnType<typeof drizzle>;
  let repo: DrizzleTransactionRepository;

  beforeAll(async () => {
    pool = new Pool({ connectionString: process.env.TEST_DATABASE_URL });
    db = drizzle(pool, { schema });
    repo = new DrizzleTransactionRepository(db);
  });

  afterAll(async () => {
    await pool.end();
  });

  beforeEach(async () => {
    // Clean test data
    await db.delete(schema.transactions);
  });

  it("should persist and retrieve a transaction", async () => {
    const transaction = Transaction.create({
      userId: "test-user",
      description: "Test",
      amountInCents: 1000,
      type: "income",
      date: new Date(),
    });

    await repo.save(transaction);
    const found = await repo.findById(transaction.id);

    expect(found).not.toBeNull();
    expect(found?.id).toBe(transaction.id);
    expect(found?.description).toBe("Test");
  });
});
```

## Module Boundary Tests

Verify modules communicate only through defined interfaces.

```typescript
// src/modules/transactions/__tests__/transactions.integration.spec.ts
import { describe, it, expect } from "vitest";
import { Test } from "@nestjs/testing";
import { TransactionsModule } from "../transactions.module";
import { EventEmitterModule } from "@nestjs/event-emitter";

describe("TransactionsModule", () => {
  it("should compile the module", async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        EventEmitterModule.forRoot(),
        TransactionsModule,
      ],
    })
      .overrideProvider(DRIZZLE_DB)
      .useValue({}) // Mock DB for compilation test
      .compile();

    expect(moduleRef).toBeDefined();
  });

  it("should export only public API", () => {
    const metadata = Reflect.getMetadata("exports", TransactionsModule);
    // Verify only intended services are exported
    expect(metadata).toContain(TransactionReadService);
    expect(metadata).not.toContain(InternalTransactionHelper);
  });
});
```

## Event Listener Tests

```typescript
// src/modules/balance/listeners/on-transaction-created.listener.spec.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { OnTransactionCreatedListener } from "./on-transaction-created.listener";
import { TransactionCreatedEvent } from "@/shared/contracts/events";

describe("OnTransactionCreatedListener", () => {
  let listener: OnTransactionCreatedListener;
  let mockBalanceService: { recalculate: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    mockBalanceService = { recalculate: vi.fn().mockResolvedValue(undefined) };
    listener = new OnTransactionCreatedListener(mockBalanceService as any);
  });

  it("should trigger balance recalculation", async () => {
    const event = new TransactionCreatedEvent(
      "tx-1", "user-1", 5000, "expense", "cat-1", new Date(),
    );

    await listener.handle(event);

    expect(mockBalanceService.recalculate).toHaveBeenCalledWith("user-1");
  });
});
```

## Vitest Configuration

Fincheck uses two Vitest configs:

- `vitest.config.ts` — Unit tests (default)
- `vitest.config.e2e.ts` — E2E tests (separate DB, longer timeout)

Run module tests:
```bash
# Unit tests for a specific module
bun run --filter @fincheck/api test -- --testPathPattern=modules/transactions

# All API tests
bun run --filter @fincheck/api test
```

## Test Doubles

| Dependency | Strategy |
|---|---|
| Repository | Mock (vi.fn) with typed interface |
| DrizzleDB | Mock for unit tests, real DB for integration |
| EventEmitter2 | Mock (vi.fn) — verify emit calls |
| EnvService | Inline mock: `{ get: vi.fn().mockReturnValue("value") }` |
| External APIs | Mock at HTTP level or service boundary |

## Coverage Goals

| Layer | Target | What to Test |
|---|---|---|
| Domain | 90%+ | Entity creation, validation, business rules |
| Application | 80%+ | Use-case flows, edge cases, error paths |
| Infrastructure | 70%+ | Repository CRUD, mapper correctness |
| Presentation | 60%+ | Route wiring, DTO validation, auth guards |
