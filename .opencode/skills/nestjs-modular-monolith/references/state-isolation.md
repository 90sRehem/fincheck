# State Isolation

Patterns for ensuring strict data boundaries between modules.

## Core Rule

**Each module owns its data.** No module reads or writes another module's tables directly.

## Entity Naming Conventions

Prefix entities and tables with the module name to prevent collisions:

| Module | Entity | Table Name |
|---|---|---|
| `transactions` | `Transaction` | `transactions` |
| `transactions` | `TransactionCategory` | `transaction_categories` |
| `billing` | `BillingPlan` | `billing_plans` |
| `billing` | `BillingSubscription` | `billing_subscriptions` |
| `balance` | `BalanceSnapshot` | `balance_snapshots` |

**Exception:** Auth tables (`users`, `sessions`, `accounts`, `verifications`) are owned by `core/auth/` and are shared infrastructure — not a domain module.

## Drizzle Schema Ownership

Each module defines its own tables in a dedicated schema file:

```typescript
// src/core/database/drizzle/schemas/transactions-schema.ts
// OWNED BY: transactions module

import { pgTable, text, integer, timestamp } from "drizzle-orm/pg-core";
import { users } from "./auth-schema"; // FK reference only

export const transactions = pgTable("transactions", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => users.id),
  description: text("description").notNull(),
  amountInCents: integer("amount_in_cents").notNull(),
  type: text("type", { enum: ["income", "expense"] }).notNull(),
  categoryId: text("category_id").references(() => transactionCategories.id),
  date: timestamp("date", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const transactionCategories = pgTable("transaction_categories", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  icon: text("icon"),
  type: text("type", { enum: ["income", "expense"] }).notNull(),
});
```

## Cross-Module Data Access

When Module B needs data from Module A:

### Option 1: Exported Read Service (Preferred for Queries)

```typescript
// Module A exports a read-only service
@Module({
  exports: [TransactionReadService],
})
export class TransactionsModule {}

// Module B injects it
@Injectable()
export class BalanceCalculator {
  constructor(private readonly transactionReader: TransactionReadService) {}

  async calculate(userId: string): Promise<number> {
    const transactions = await this.transactionReader.findByUserId(userId);
    return transactions.reduce((sum, t) => sum + t.amount, 0);
  }
}
```

### Option 2: Events (Preferred for Commands)

Module A publishes an event; Module B reacts by updating its own state.

```typescript
// Transactions module publishes event
this.eventEmitter.emit("transaction.created", new TransactionCreatedEvent(...));

// Balance module listens and updates its OWN table
@OnEvent("transaction.created")
async handle(event: TransactionCreatedEvent) {
  await this.db.update(balanceSnapshots)
    .set({ amount: sql`amount + ${event.amount}` })
    .where(eq(balanceSnapshots.userId, event.userId));
}
```

### Option 3: Materialized View (For Complex Reads)

When read patterns don't match any module's write model:

```typescript
// A separate read model maintained via events
export const dashboardSummary = pgTable("dashboard_summary", {
  userId: text("user_id").primaryKey(),
  totalIncome: integer("total_income").default(0),
  totalExpenses: integer("total_expenses").default(0),
  balance: integer("balance").default(0),
  lastUpdated: timestamp("last_updated").defaultNow(),
});
```

## Anti-Patterns

### Direct Cross-Module Table Access

```typescript
// BAD — Balance module directly queries transactions table
@Injectable()
export class BalanceService {
  async calculate(userId: string) {
    // This breaks state isolation
    const rows = await this.db.select().from(transactions).where(eq(transactions.userId, userId));
  }
}

// GOOD — Use exported service or events
@Injectable()
export class BalanceService {
  constructor(private readonly transactionReader: TransactionReadService) {}

  async calculate(userId: string) {
    const transactions = await this.transactionReader.findByUserId(userId);
  }
}
```

### Shared Join Tables

```typescript
// BAD — Join table owned by neither module
export const userTransactionTags = pgTable("user_transaction_tags", {
  userId: text("user_id"),      // Owned by users module
  transactionId: text("tx_id"), // Owned by transactions module
  tag: text("tag"),
});

// GOOD — Tag belongs to transactions module
export const transactionTags = pgTable("transaction_tags", {
  id: text("id").primaryKey(),
  transactionId: text("transaction_id").references(() => transactions.id),
  tag: text("tag").notNull(),
  // userId is implicit via transaction ownership
});
```

### Duplicate Entity Names

```typescript
// BAD — Both modules have a "Category" entity
// src/modules/transactions/domain/category.ts
export class Category { ... }
// src/modules/budget/domain/category.ts
export class Category { ... }

// GOOD — Prefix with module name
export class TransactionCategory { ... }
export class BudgetCategory { ... }
```

## Isolation Validation Script

Run periodically to check for violations:

```bash
#!/bin/bash
# Check for duplicate table names across schema files
echo "=== Checking duplicate table names ==="
grep -rh "pgTable(" src/core/database/drizzle/schemas/ src/modules/*/infra/persistence/ 2>/dev/null \
  | grep -o '"[^"]*"' | head -1 | sort | uniq -d

# Check for cross-module direct Drizzle imports
echo "=== Checking cross-module schema imports ==="
for module in src/modules/*/; do
  module_name=$(basename "$module")
  grep -r "from.*modules/" "$module" 2>/dev/null | grep -v "$module_name" | grep -v "index"
done

echo "=== Done ==="
```

## Foreign Key References

Modules can reference other module's PKs via FK constraints, but:
- The FK is a `text` column, not a join
- The owning module controls the lifecycle
- The referencing module doesn't query the foreign table

```typescript
// OK — transactions references users.id via FK
export const transactions = pgTable("transactions", {
  userId: text("user_id").notNull().references(() => users.id),
  // This is a data integrity constraint, not a query dependency
});
```
