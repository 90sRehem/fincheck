# API Module Restructure — Tasks

**Reference:** [spec.md](./spec.md)

---

## Task Groups

### Group A: Foundation (Prerequisites)

T1-T3 must complete before any module restructuring can begin.

| ID | Task | Verification | Dependencies |
|----|------|--------------|---------------|
| **T1** | Create schema-registry.ts in `core/database/drizzle/` that aggregates auth schemas + placeholder for module schemas | File exists with proper exports, type is exportable | None |
| **T2** | Update `core/database/connection.ts` to pass schema to drizzle() | DrizzleDB type includes schema, `db.query.*` is available | T1 |
| **T3** | Update `drizzle.config.ts` to include module schema glob: `./src/modules/*/infra/drizzle/schemas/*` | `drizzle-kit generate` discovers schemas from both locations | None |

---

### Group B: Domain Layer Restructure (bank-accounts)

T4-T8 restructure the domain layer. Domain has no NestJS dependencies so it can be tested in isolation.

| ID | Task | Verification | Dependencies |
|----|------|--------------|---------------|
| **T4** | Move abstract `BankAccountRepository` from `infra/persistence/` to `domain/repositories/bank-account.repository.ts` | File moved, update barrel exports in domain/index.ts | None |
| **T5** | Extract UseCase classes from existing use-case files into `domain/use-cases/` — pure logic without @Injectable | UseCase files in domain/, no @Injectable decorator | T4 (needs repo import path) |
| **T6** | Create domain barrel: `domain/index.ts` re-exports entities, repositories, validators, use-cases | Importing from `domain` works for all exports | T4, T5 |
| **T7** | Move domain entities (BankAccount entity, validator, type) to proper subdirs: `domain/entities/`, `domain/value-objects/` | Files in correct subdirs, barrel exports updated | None |
| **T8** | Move Drizzle schema from `core/database/drizzle/schemas/bank-account-schema.ts` to `modules/bank-accounts/infra/drizzle/schemas/bank-account-schema.ts` | Schema file moved, import paths updated | T3 (glob must include module path) |

---

### Group C: Infrastructure & Application Layers (bank-accounts)

T9-T12 build the infrastructure adapter and application service layer. These depend on domain being ready.

| ID | Task | Verification | Dependencies |
|----|------|--------------|---------------|
| **T9** | Move mapper to `infra/mappers/bank-account.mapper.ts` (or create new if needed) | Mapper in infra/, imports from domain | T7 |
| **T10** | Update concrete `DrizzleBankAccountRepository` to implement the moved abstract `BankAccountRepository` from domain | Repository implements correct interface, import paths fixed | T4, T8 |
| **T11** | Create application service for each use-case in `application/{use-case}/{use-case}.service.ts` — @Injectable wrapper that calls domain UseCase | Service files created, registered in module | T5 (use-cases exist) |
| **T12** | Move DTOs to `application/{use-case}/{use-case}.dto.ts` | DTOs in application layer, controllers updated to import from new path | None |

---

### Group D: Presentation Layer & Module Assembly (bank-accounts)

T13-T15 wire everything together with controllers and the NestJS module.

| ID | Task | Verification | Dependencies |
|----|------|--------------|---------------|
| **T13** | Create `presentation/` folder, move controllers there | Controllers in presentation/, import application services | T11, T12 |
| **T14** | Update `bank-accounts.module.ts` to register presentation, application, and infra layers correctly | Module imports from new structure, all providers registered | T9, T10, T11, T13 |
| **T15** | Test the module: start NestJS, make HTTP requests to verify CRUD works | All 4 endpoints (create, list, update, delete) return expected responses | T14 |

---

## Execution Order

```
Group A (Foundation) ─────┐
                         ├─► Group B (Domain) ──────┬─► Group C (Infra+App) ──────┬─► Group D (Presentation+Module)
Group A (Foundation) ─────┘                          │                             │
                                                    │                             │
                                          T8 requires T3                     T13 requires T11,T12
```

**Parallelization hints:**
- T1 and T3 are independent — run in parallel
- T4, T5, T7 are independent within Group B — run in parallel once T1 is done (T5 needs T4's import path, but can start after T4 completes)
- T9, T10, T11, T12 in Group C can run in parallel once Group B is done
- T13, T14 depend on T11, T12 — run sequentially after Group C

---

## Batch Commands for Verification

```bash
# After Group A
bun run --filter @fincheck/api typecheck

# After Group B
bun run --filter @fincheck/api typecheck

# After Group C  
bun run --filter @fincheck/api typecheck

# After Group D
bun run --filter @fincheck/api dev  # Manual API testing
```

---

## Notes

- Keep the 4 existing CRUD operations working — no behavior changes, only structure changes
- The bank-accounts module is the reference implementation; users/session modules can follow the same pattern later
- If any verification fails, stop and fix before proceeding to next task
- LSP errors about decorators are expected during transition (decorators valid only with correct module config)