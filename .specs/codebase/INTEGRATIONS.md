# External Integrations

## Database

### PostgreSQL

**Purpose:** Primary data store for all application data

**Implementation:**

- Location: `apps/api/src/core/database/connection.ts`
- ORM: Drizzle ORM 0.45.1
- Driver: `pg` (node-postgres)

**Configuration:**

- Set via environment variables (see `apps/api/src/core/env/env.schema.ts`)
- Connection string format: `postgresql://user:password@host:port/database`
- Docker Compose: `docker-compose.yml` defines PostgreSQL 15 service

**Schema:**

- Auth tables: `users`, `sessions`, `accounts`, `verifications` (from better-auth)
- Module tables: `bank_accounts` (from `modules/bank-accounts/infra/drizzle/schemas/`)

---

## Authentication

### better-auth

**Purpose:** Self-hosted authentication with session management

**Implementation:**

- Config: `apps/api/src/core/auth/auth.config.ts`
- NestJS module: `apps/api/src/core/auth/auth.module.ts`
- Provider: `apps/api/src/core/auth/auth.provider.ts`
- Bootstrap: `apps/api/src/core/auth/auth.ts` (for CLI)

**Features enabled:**

- Email + password authentication
- Session management (httpOnly cookies)
- UUIDv4 IDs
- OpenAPI plugin

**Authentication flow:**

1. User submits credentials to `/api/auth/sign-in/email`
2. better-auth creates session, returns session + client token
3. Frontend stores token in localStorage
4. Subsequent requests include `Authorization: Bearer <token>`

---

## API Documentation

### Swagger + Scalar

**Purpose:** Interactive API documentation

**Implementation:**

- `apps/api/src/main.ts` — Swagger config + Scalar mounting
- Endpoint: `GET /docs`

**Configuration:**

```typescript
const config = new DocumentBuilder()
  .setTitle("Fincheck API")
  .setDescription("Fincheck API")
  .setVersion("1.0")
  .build();
```

**Access:** `http://localhost:3333/docs` (when running locally)

---

## Environment Configuration

### Zod Schema Validation

**Location:** `apps/api/src/core/env/env.schema.ts`

**Purpose:** Validate all required environment variables at startup

**Key variables:**

- `PORT` — API server port (default: 3333)
- `DATABASE_URL` — PostgreSQL connection string
- `BETTER_AUTH_SECRET` — better-auth secret key
- `BETTER_AUTH_URL` — Public URL for better-auth (e.g., http://localhost:3333)

---

## No Third-Party External Services

The application does **not** integrate with:

- Payment processors (Stripe, Mercado Pago, etc.)
- Bank aggregators (Plaid, TrueLayer, Open Banking)
- Email services (SendGrid, Resend, etc.)
- Analytics (GA4, Posthog, etc.)
- Error tracking (Sentry, etc.) — not integrated yet
- Cloud storage (S3, etc.)

All functionality is self-hosted.

---

## Docker Compose

**Purpose:** Local development infrastructure

**Location:** `docker-compose.yml`

**Services:**

- `postgres` — PostgreSQL 15 database
- `localstack` — AWS local stack (for future S3/infrastructure)

**Commands:**

```bash
docker-compose up -d    # Start services
docker-compose down     # Stop services
```

---

## Future Integrations (Out of Scope)

These are planned for post-v1:

- Bank sync (Plaid or similar)
- Email notifications
- Error tracking (Sentry)
- Analytics