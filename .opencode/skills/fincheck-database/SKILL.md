---
name: fincheck-database
description: Drizzle ORM setup - schema conventions, migration workflow, DI patterns, better-auth tables, PostgreSQL configuration, drizzle-kit commands
---

# Fincheck Database (Drizzle ORM)

Database setup, schema conventions, and migration workflow for PostgreSQL + Drizzle.

## Connection Setup

**File:** `src/core/database/connection.ts`

```typescript
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

export function createDatabaseConnection(connectionString: string) {
  const pool = new Pool({ connectionString });
  return drizzle(pool);
}
```

**Type:** `DrizzleDB` (inferred from `drizzle()` return)

## Dependency Injection

**Symbol token:** `src/core/database/constants.ts`
```typescript
export const DRIZZLE_DB = Symbol("DRIZZLE_DB");
```

**Module:** `src/core/database/database.module.ts`
```typescript
@Global()
@Module({
  providers: [
    {
      provide: DRIZZLE_DB,
      inject: [EnvService],
      useFactory: (envService: EnvService) => {
        return createDatabaseConnection(envService.get("DATABASE_URL"));
      },
    },
  ],
  exports: [DRIZZLE_DB],
})
export class DatabaseModule {}
```

**Usage in services:**
```typescript
import { Inject } from "@nestjs/common";
import { DRIZZLE_DB } from "@/core/database/constants";
import type { DrizzleDB } from "@/core/database";

@Injectable()
export class UsersRepository {
  constructor(@Inject(DRIZZLE_DB) private readonly db: DrizzleDB) {}

  async findById(id: string) {
    return this.db.query.users.findFirst({ where: eq(users.id, id) });
  }
}
```

## Schema Conventions

**Location:** `src/core/database/drizzle/schemas/`

**Table naming:** Plural (enforced by better-auth `usePlural: true`)

**ID strategy:**
- Type: `text` (not native UUID)
- Generation: `crypto.randomUUID()` → UUIDv4 strings
- Definition: `id: text("id").primaryKey()`

**Timestamps:**
```typescript
createdAt: timestamp("created_at").defaultNow().notNull(),
updatedAt: timestamp("updated_at").defaultNow().notNull()
  .$onUpdate(() => new Date()),
```

**Example schema:**
```typescript
import { pgTable, text, timestamp, boolean } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").unique().notNull(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
    .$onUpdate(() => new Date()),
});
```

## Relations

**File:** Same file as table, after table definitions

```typescript
import { relations } from "drizzle-orm";

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  accounts: many(accounts),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));
```

## better-auth Tables

**File:** `src/core/database/drizzle/schemas/auth-schema.ts`

**4 tables:**

| Table | Fields | Notes |
|---|---|---|
| `users` | id, name, email, emailVerified, image, createdAt, updatedAt | Main user table |
| `sessions` | id, expiresAt, token, createdAt, updatedAt, ipAddress, userAgent, userId (FK) | Index on userId |
| `accounts` | id, accountId, providerId, userId (FK), accessToken, refreshToken, idToken, scope, password, ... | Email+password stored here |
| `verifications` | id, identifier, value, expiresAt, createdAt, updatedAt | Email verification |

**Relations:** users → many sessions/accounts, sessions/accounts → one user

## Migration Workflow

**1. Modify schema** in `src/core/database/drizzle/schemas/`

**2. Generate migration:**
```bash
bunx drizzle-kit generate
```

Creates SQL file in `src/core/database/drizzle/migrations/` with auto-incremented prefix (e.g., `0001_new_migration.sql`)

**3. Review migration:**
- Check SQL accuracy
- Verify data preservation logic if altering tables
- Add custom SQL if needed (e.g., data migrations)

**4. Run migration:**
```bash
bunx drizzle-kit migrate
```

Executes pending migrations against database. Uses `drizzle_migrations` table to track applied migrations.

**5. Commit both:**
- Schema changes (`schemas/*.ts`)
- Migration files (`migrations/*.sql`)

## drizzle.config.ts

**File:** `/apps/api/drizzle.config.ts`

```typescript
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./src/core/database/drizzle/migrations",
  schema: "./src/core/database/drizzle/schemas/*",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

**Note:** Requires `// biome-ignore lint/style/noDefaultExport` (Drizzle Kit API requirement)

## Docker Setup

**File:** `docker-compose.yml`

```yaml
postgres:
  image: postgres:15-alpine
  ports: ["5432:5432"]
  environment:
    POSTGRES_USER: ${POSTGRES_USER}
    POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    POSTGRES_DB: ${POSTGRES_DB}
  volumes:
    - postgres_data:/var/lib/postgresql/data
  healthcheck:
    test: ["CMD", "pg_isready", "-U", "${POSTGRES_USER}"]
    interval: 5s
    retries: 10
    start_period: 10s
```

## Commands

| Command | Purpose |
|---|---|
| `bunx drizzle-kit generate` | Generate migration from schema changes |
| `bunx drizzle-kit migrate` | Run pending migrations |
| `bunx drizzle-kit studio` | Open Drizzle Studio GUI (browse/edit data) |
| `bunx drizzle-kit push` | Push schema changes directly (dev only, skips migrations) |
| `bunx drizzle-kit drop` | Drop migration |

## Query Patterns

**Select:**
```typescript
const user = await db.query.users.findFirst({
  where: eq(users.email, "user@example.com"),
  with: { sessions: true }, // Include relations
});
```

**Insert:**
```typescript
await db.insert(users).values({
  id: crypto.randomUUID(),
  name: "John Doe",
  email: "john@example.com",
});
```

**Update:**
```typescript
await db.update(users)
  .set({ name: "Jane Doe" })
  .where(eq(users.id, userId));
```

**Delete:**
```typescript
await db.delete(users).where(eq(users.id, userId));
```

## Transaction Pattern

```typescript
await db.transaction(async (tx) => {
  await tx.insert(users).values({ ... });
  await tx.insert(accounts).values({ ... });
  // Atomic: both succeed or both roll back
});
```
