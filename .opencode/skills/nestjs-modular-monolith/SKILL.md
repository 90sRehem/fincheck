---
name: nestjs-modular-monolith
description: Modular monolith architecture for NestJS — bounded contexts, module boundaries, event-driven communication, state isolation, CQRS (optional), Clean Architecture layers
---

# NestJS Modular Monolith

Consultative architect and implementer for modular monolith systems using NestJS. Combines microservice-level modularity (boundaries, independence, testability) with monolith simplicity (single deployment, shared infrastructure).

## When to Use

- Designing bounded contexts and domain boundaries for new modules
- Creating NestJS modules with Clean Architecture layers
- Setting up event-driven communication between modules
- Implementing CQRS when the domain justifies it
- Reviewing module boundaries and state isolation
- Planning monolith-to-microservices evolution paths

## When NOT to Use

- Simple CRUD with < 10 endpoints (use `nestjs-ddd` skill instead)
- Frontend questions (use `react-fsd`)
- General NestJS questions without architectural context
- Microservices-first architectures

## 10 Modular Monolith Principles

1. **Boundaries** — Clear interfaces between modules, minimal coupling
2. **Composability** — Modules can be recombined dynamically
3. **Independence** — Each module is self-contained with its own domain
4. **Scalability** — Per-module optimization without system-wide changes
5. **Explicit Communication** — Contracts between modules, never implicit
6. **Replaceability** — Any module can be substituted without system impact
7. **Logical Deployment Separation** — Maintain separation even in monolith
8. **State Isolation** — Strict data boundaries, no shared database tables
9. **Observability** — Module-level monitoring and tracing
10. **Resilience** — Failures in one module don't cascade

## Behavioral Guidelines

**Think Before Coding.** Before implementing any module: state assumptions about domain boundaries explicitly. If multiple bounded context interpretations exist, present them. If a simpler module structure exists, say so.

**Simplicity First.** No CQRS unless the domain has distinct read/write patterns. No Event Sourcing unless audit trail is a real requirement. No abstractions for single-use code. Start with simple services, upgrade only when complexity warrants it.

**Surgical Changes.** Don't "improve" adjacent modules not part of the task. Match existing style. Mention unrelated issues — don't fix them silently.

**Goal-Driven Execution.** Every architectural decision has verifiable success criteria.

## Fincheck Stack Context

This skill adapts modular monolith patterns to Fincheck's actual stack:

| Component | Fincheck Choice | Notes |
|---|---|---|
| Framework | NestJS 11 + Express | `NestExpressApplication`, port 3333 |
| ORM | Drizzle + PostgreSQL | Symbol DI token `DRIZZLE_DB`, text UUIDs |
| Auth | better-auth + `@thallesp/nestjs-better-auth` | Global guard, `@AllowAnonymous()` |
| Monorepo | Bun + Turborepo | NOT NX — use `turbo` commands |
| Linting | Biome | `useImportType: off` for NestJS |
| Validation | Zod | DTOs and env config |
| Testing | Vitest | Not Jest |

**Key differences from generic modular monolith:**
- Uses Drizzle (not Prisma) — symbol-based DI, raw SQL capability
- Uses Turborepo (not NX) — no NX library boundary enforcement, use conventions instead
- Uses Zod (not class-validator) — schema-first validation
- `shared/domain/` for shared kernel, `modules/` for bounded contexts
- Per-module schemas in `core/database/drizzle/schemas/` (current) or co-located per module (target)

## Core Workflow

### Phase 1: Discovery

Before writing code, understand the domain:

1. **Identify bounded contexts** — Which business capabilities are distinct?
2. **Map aggregates and entities** — What are the core domain objects?
3. **Clarify module relationships** — Which modules need to communicate?
4. **Identify integration points** — External systems, third-party APIs?

**Exit criteria:**
- [ ] Bounded contexts identified with clear responsibilities
- [ ] Communication patterns defined (events vs. direct)
- [ ] Data ownership mapped per module

### Phase 2: Design

Architect before implementation:

1. **Design module structure** — Map bounded contexts to `src/modules/` directories
2. **Define module interfaces** — Public API surface (exported services/controllers)
3. **Plan communication** — Events for cross-module, direct calls within module
4. **Design data model** — Per-module schemas with state isolation

Load `references/architecture-patterns.md` for Clean Architecture layers.

**Exit criteria:**
- [ ] Each module has defined responsibilities and public interface
- [ ] Communication contracts specified
- [ ] Data model shows strict module ownership
- [ ] No shared entities across module boundaries

### Phase 3: Implementation

For each module, implement in this order:

**Default approach (simple services):**
1. **Domain layer** — Entities, value objects, repository interfaces in `shared/domain/`
2. **Application layer** — Use-case folders with service + DTO + controller
3. **Infrastructure layer** — Repository implementations in `<module>/infra/persistence/`
4. **Module definition** — NestJS module with explicit imports/exports

**CQRS approach** (only when domain warrants it):
1. **Domain layer** — Same as above
2. **Application layer** — Commands, queries, handlers (replace services)
3. **Infrastructure layer** — Same as above
4. **Module definition** — Import `CqrsModule`, register handlers

Load references on demand:
- `references/architecture-patterns.md` — Layers, DDD patterns, CQRS
- `references/module-communication.md` — Event system, cross-module contracts
- `references/state-isolation.md` — Entity naming, isolation checks
- `references/authentication.md` — Auth guards, session, better-auth integration
- `references/testing-patterns.md` — Vitest patterns, module testing
- `references/stack-configuration.md` — Bootstrap, Drizzle, Biome configs

### Phase 4: Validation

1. **State isolation check** — No duplicate entity names across modules
2. **Boundary check** — No direct cross-module internal imports
3. **Test coverage** — Unit tests for services, integration for boundaries
4. **Type check** — `turbo check-types` passes

## Module Structure (Fincheck-Adapted)

```
src/
├── core/                           # Infrastructure (IMPLEMENTED)
│   ├── auth/                       # better-auth global guard
│   ├── database/                   # Drizzle + DRIZZLE_DB token
│   └── env/                        # Zod-validated EnvService
│
├── modules/                        # Bounded contexts
│   └── <context>/
│       ├── <use-case>/             # One folder per use-case
│       │   ├── <use-case>.controller.ts
│       │   ├── <use-case>.service.ts
│       │   ├── <use-case>.dto.ts
│       │   └── <use-case>.spec.ts
│       ├── infra/
│       │   ├── persistence/        # Drizzle repository implementations
│       │   └── mappers/            # Domain <-> DB mappers
│       ├── domain/                 # Module-specific entities/VOs (optional)
│       └── <context>.module.ts     # NestJS module
│
├── shared/
│   ├── domain/
│   │   ├── entities/               # Base Entity class
│   │   ├── events/                 # Domain event base + bus
│   │   ├── types/                  # Shared type definitions
│   │   ├── validation/             # Shared validation utilities
│   │   └── value-objects/          # Base ValueObject class
│   └── contracts/                  # Cross-module event/command interfaces
│
└── app.module.ts                   # Root: imports all domain modules
```

## Implementation Rules

### MUST DO
- Use Drizzle DI: `@Inject(DRIZZLE_DB) private readonly db: DrizzleDB`
- Validate inputs via Zod schemas (not class-validator)
- Define repository interfaces in domain layer, implement in infra
- Prefix module-specific entities to avoid collisions (e.g., `BillingPlan` not `Plan`)
- Use events for cross-module communication
- Export only public API from NestJS module definitions
- Write Vitest tests for use-case services
- Global modules (Env, Database) inject without importing
- Use `@AllowAnonymous()` for public routes, `@Session()` for user context

### MUST NOT DO
- Share database tables across modules (except auth tables in `core/`)
- Import internal services from another module directly
- Use `any` — TypeScript strict mode enforced
- Create circular dependencies between modules
- Use generic entity names without module prefix
- Hardcode configuration (use `EnvService`)
- Skip error handling — use domain-specific exceptions
- Force CQRS on modules that don't need it

## Quick Anti-Pattern Detection

```bash
# Check duplicate entity/table names across modules
grep -r "pgTable\|export class.*Entity" src/modules/ | sort | uniq -d

# Detect direct cross-module imports (should use barrel exports)
grep -r "from.*modules/" src/modules/ | grep -v "from.*modules/$(dirname)" | grep -v index

# Find shared mutable state
grep -r "export.*=.*new" src/modules/ | grep -v test | grep -v spec

# Check for synchronous cross-module service calls
grep -r "await.*\..*Service" src/modules/ | grep -v "this\."
```

## Reference Guide

Load detailed guidance based on current task:

| Topic | Reference | Load When |
|---|---|---|
| Architecture | `references/architecture-patterns.md` | Designing modules, layers, DDD patterns, CQRS |
| Communication | `references/module-communication.md` | Events, cross-module contracts, publishers |
| State Isolation | `references/state-isolation.md` | Entity duplication, naming conventions, anti-patterns |
| Authentication | `references/authentication.md` | Auth guards, session, better-auth specifics |
| Testing | `references/testing-patterns.md` | Vitest unit/integration tests for modules |
| Stack Config | `references/stack-configuration.md` | Bootstrap, Drizzle schemas, Biome, DTOs |

## Relationship to Other Skills

- **`nestjs-ddd`** — Covers basic DDD patterns (entity/VO templates, use-case folders). This skill extends those with module boundary enforcement, event communication, and state isolation.
- **`fincheck-database`** — Covers Drizzle specifics. This skill adds per-module schema ownership patterns.
- **`fincheck-code-quality`** — Covers Biome/TS standards. This skill adds module-level architectural constraints.
