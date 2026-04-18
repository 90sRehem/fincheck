## ADDED Requirements

### Requirement: Currencies lookup table exists
The system SHALL have a `currencies` table in PostgreSQL with columns: `id` (text PK), `code` (text, UNIQUE, ISO 4217), `name` (text). The `id` field SHALL be equal to the ISO 4217 code (e.g., `"BRL"`).

#### Scenario: Table contains seed data
- **WHEN** the database is seeded
- **THEN** the `currencies` table MUST contain at least: `{ id: "BRL", code: "BRL", name: "Real Brasileiro" }`, `{ id: "USD", code: "USD", name: "US Dollar" }`, `{ id: "EUR", code: "EUR", name: "Euro" }`

#### Scenario: Seed is idempotent
- **WHEN** the seed script runs multiple times
- **THEN** no duplicate rows are created (onConflictDoNothing)

### Requirement: Currency entity and repository
The system SHALL have a `Currency` domain entity with readonly properties `id`, `code`, `name`. An abstract `CurrencyRepository` port SHALL define `findAll(): Promise<Currency[]>`. A `DrizzleCurrencyRepository` adapter SHALL implement this port.

#### Scenario: Repository returns all currencies
- **WHEN** `CurrencyRepository.findAll()` is called
- **THEN** it returns all rows from the `currencies` table mapped to `Currency` entities

### Requirement: List currencies endpoint
The system SHALL expose `GET /api/v1/currencies` that returns all currencies. The endpoint MUST require authentication (global auth guard). The response shape SHALL be `{ id: string, code: string, name: string }[]`.

#### Scenario: Authenticated user lists currencies
- **WHEN** an authenticated user sends `GET /api/v1/currencies`
- **THEN** the response is 200 with an array of currency objects

#### Scenario: Unauthenticated request is rejected
- **WHEN** an unauthenticated user sends `GET /api/v1/currencies`
- **THEN** the response is 401 Unauthorized

### Requirement: Currencies module registration
The `CurrenciesModule` SHALL be registered in `app.module.ts`. It SHALL provide: `ListCurrenciesController`, `ListCurrenciesService`, and the `CurrencyRepository` → `DrizzleCurrencyRepository` binding. The Drizzle schema SHALL be registered in `schema-registry.ts`.

#### Scenario: Module is loadable
- **WHEN** the NestJS application bootstraps
- **THEN** the `CurrenciesModule` is loaded without errors and `GET /currencies` is routable

### Requirement: Currency Swagger documentation
The `GET /api/v1/currencies` endpoint SHALL have Swagger decorators: `@ApiTags("Currencies")`, `@ApiCookieAuth`, `@ApiOperation`, and `@ApiResponse` with the response schema.

#### Scenario: Swagger docs show currencies endpoint
- **WHEN** a developer visits `/docs`
- **THEN** the Currencies tag is visible with the GET endpoint documented
