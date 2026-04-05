# Module Communication

Patterns for cross-module communication in the Fincheck modular monolith.

## Communication Principles

1. **Within a module:** Direct service calls (constructor injection)
2. **Between modules:** Events (loose coupling) or exported service interface (tight but explicit)
3. **Never:** Import internal/private services from another module

## Event-Driven Communication

### NestJS EventEmitter (In-Process)

For a modular monolith, NestJS `@nestjs/event-emitter` is the recommended starting point. It's synchronous in-process but decouples modules.

```bash
bun add @nestjs/event-emitter
```

**Setup:**
```typescript
// src/app.module.ts
import { EventEmitterModule } from "@nestjs/event-emitter";

@Module({
  imports: [
    EventEmitterModule.forRoot({
      wildcard: false,
      delimiter: ".",
      maxListeners: 10,
      verboseMemoryLeak: true,
    }),
    // ... other modules
  ],
})
export class AppModule {}
```

### Domain Events

**Define events in shared contracts:**
```typescript
// src/shared/contracts/events/transaction-created.event.ts
export class TransactionCreatedEvent {
  static readonly EVENT_NAME = "transaction.created" as const;

  constructor(
    public readonly transactionId: string,
    public readonly userId: string,
    public readonly amount: number,
    public readonly type: "income" | "expense",
    public readonly categoryId: string,
    public readonly occurredAt: Date,
  ) {}
}
```

**Publish from source module:**
```typescript
// src/modules/transactions/create-transaction/create-transaction.service.ts
import { EventEmitter2 } from "@nestjs/event-emitter";

@Injectable()
export class CreateTransactionService {
  constructor(
    private readonly transactionRepo: TransactionRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(dto: CreateTransactionDto): Promise<Transaction> {
    const transaction = Transaction.create(dto);
    await this.transactionRepo.save(transaction);

    this.eventEmitter.emit(
      TransactionCreatedEvent.EVENT_NAME,
      new TransactionCreatedEvent(
        transaction.id,
        dto.userId,
        transaction.amount,
        transaction.type,
        transaction.categoryId,
        new Date(),
      ),
    );

    return transaction;
  }
}
```

**Subscribe in consuming module:**
```typescript
// src/modules/balance/listeners/on-transaction-created.listener.ts
import { OnEvent } from "@nestjs/event-emitter";

@Injectable()
export class OnTransactionCreatedListener {
  constructor(private readonly balanceService: UpdateBalanceService) {}

  @OnEvent(TransactionCreatedEvent.EVENT_NAME)
  async handle(event: TransactionCreatedEvent): Promise<void> {
    await this.balanceService.recalculate(event.userId);
  }
}
```

**Register listener in module:**
```typescript
// src/modules/balance/balance.module.ts
@Module({
  providers: [
    UpdateBalanceService,
    OnTransactionCreatedListener, // Must be registered as provider
  ],
})
export class BalanceModule {}
```

## Event Contract Organization

```
src/shared/contracts/
├── events/
│   ├── index.ts                         # Barrel export
│   ├── transaction-created.event.ts
│   ├── transaction-deleted.event.ts
│   ├── category-updated.event.ts
│   └── balance-recalculated.event.ts
└── types/
    ├── index.ts
    └── shared-types.ts                  # Types used across modules
```

## Sync vs Async Events

### In-Process (Default)

`@nestjs/event-emitter` runs listeners synchronously in the same process. Suitable for:
- Balance recalculation after transaction
- Cache invalidation
- Audit logging

### Async Queue (Evolution Path)

When a module needs async processing, introduce BullMQ:

```bash
bun add @nestjs/bullmq bullmq
```

```typescript
// Async event processing via queue
@Processor("balance-updates")
export class BalanceUpdateProcessor extends WorkerHost {
  async process(job: Job<TransactionCreatedEvent>) {
    await this.balanceService.recalculate(job.data.userId);
  }
}
```

This is the first step toward microservice extraction — the queue becomes the service boundary.

## Direct Service Export (Tight Coupling)

When events are overkill (simple read queries), export a service interface:

```typescript
// src/modules/users/users.module.ts
@Module({
  providers: [UserProfileService, /* ... */],
  exports: [UserProfileService], // Explicitly exported for other modules
})
export class UsersModule {}

// src/modules/transactions/transactions.module.ts
@Module({
  imports: [UsersModule], // Import the module, not the service
  providers: [CreateTransactionService],
})
export class TransactionsModule {}
```

**Use sparingly.** Every direct import creates a compile-time dependency. Prefer events for state-changing operations.

## Anti-Patterns

### Importing Internal Services

```typescript
// BAD — bypasses module boundary
import { InternalBillingHelper } from "../billing/helpers/internal-billing.helper";

// GOOD — import from module's public API
import { BillingModule } from "../billing/billing.module";
// Then inject the exported service via constructor
```

### Shared Mutable State

```typescript
// BAD — shared singleton state across modules
export const globalCache = new Map<string, unknown>();

// GOOD — each module manages its own state
@Injectable()
export class TransactionCacheService {
  private cache = new Map<string, Transaction>();
}
```

### Event Ping-Pong

```typescript
// BAD — circular event chains
// Module A emits → Module B handles → emits → Module A handles → emits...

// GOOD — events flow in one direction (DAG)
// Transactions → Balance (recalculate)
// Transactions → Analytics (record)
// Balance → Notifications (alert if low)
```

## Evolution to Microservices

When a module needs to become a separate service:

1. Replace `EventEmitter2` with a message broker (Redis, RabbitMQ, Kafka)
2. Replace direct service imports with API calls or shared contracts
3. Extract the module's Drizzle schema into its own database
4. Deploy separately

The event contract (`src/shared/contracts/events/`) becomes the integration contract between services.
