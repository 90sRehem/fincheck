# Testing Infrastructure

## Test Frameworks

| Area | Framework | Version |
|---|---|---|
| Backend (unit/integration) | Vitest | 3.2.3 |
| Backend (E2E) | Vitest + supertest | 3.2.3 |
| Frontend (unit) | Vitest + Testing Library | 3.0.5 |
| Docs (E2E) | Playwright | 1.57.0 |
| Coverage | @vitest/coverage-v8 | 3.2.4 |

**Additional:**

- `@nestjs/testing` — NestJS test utilities
- `@swc/core` — Fast transpilation via SWC plugin
- `unplugin-swc` — Vitest SWC integration
- `vite-tsconfig-paths` — Path alias resolution in tests

---

## Test Organization

### Backend (`apps/api`)

**Location:** `apps/api/src/` (co-located with implementation)

**Pattern:** `*.spec.ts` files

**Example:** `app.controller.spec.ts`

**Config:** `apps/api/vitest.config.ts`

### Frontend (`apps/web`)

**Location:** `apps/web/src/` (co-located)

**Pattern:** `*.test.ts` files

**Example:** `create-store.test.ts` in `shared/lib/core/store/`

**Config:** None (uses default Vitest)

### Docs (`apps/docs`)

**Location:** `.storybook/vitest.setup.ts`

**Pattern:** Storybook addons + Playwright for browser testing

---

## Testing Patterns

### Backend: NestJS + Vitest

**Approach:** Standard NestJS testing module

```typescript
import { Test, TestingModule } from "@nestjs/testing";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";

describe("AppController", () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe("root", () => {
    it('should return "Hello World!"', () => {
      expect(appController.healthCheck()).toBe("Hello World!");
    });
  });
});
```

### Frontend: React + Vitest + Testing Library

**Approach:** Render components with Testing Library, test behavior

**Dependencies:**

- `@testing-library/dom`
- `@testing-library/react`
- `jsdom` (for DOM environment)

**Example pattern (from existing test):**

```typescript
// create-store.test.ts
import { describe, it, expect } from "vitest";

describe("createStore", () => {
  it("should create a store", () => {
    // Test implementation
  });
});
```

### E2E: Backend

**Config:** `apps/api/vitest.config.e2e.ts`

**Pattern:** Uses supertest for HTTP integration testing

---

## Test Execution

### Commands

**Backend:**

```bash
bun run --filter @fincheck/api test          # Run all tests
bun run --filter @fincheck/api test:watch    # Watch mode
bun run --filter @fincheck/api test:cov      # With coverage
bun run --filter @fincheck/api test:ui        # UI mode
bun run --filter @fincheck/api test:e2e       # E2E tests
```

**Frontend:**

```bash
bun run --filter @fincheck/web test          # Run all tests
```

**Docs:**

```bash
bun run --filter @fincheck/docs test          # Storybook tests
```

### Configuration

**Backend Vitest config** (`apps/api/vitest.config.ts`):

```typescript
export default defineConfig({
  test: {
    globals: true,
    root: "./",
    exclude: ["data", "dist", "node_modules"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      enabled: true,
    },
  },
  plugins: [tsConfigPaths(), swc.vite(...)],
});
```

**Key features:**

- `globals: true` — Vitest globals (describe, it, expect) available
- `root: "./"` — Run from project root
- Coverage enabled by default
- SWC for fast transpilation

---

## Coverage Targets

**Current:** Not measurable (minimal test coverage)

**Goals:** Not documented

**Enforcement:** None (coverage is generated but not enforced)

---

## Known Issues

### Stale Test Files

The existing test file `apps/api/src/app.controller.spec.ts` is outdated:

- **Expected:** Test expects `"Hello World!"` from health check
- **Actual:** `AppService.healthCheck()` returns `"healthy"` (see `app.service.ts`)
- **Result:** Test will fail

```typescript
// app.controller.spec.ts:18-20
it('should return "Hello World!"', () => {
  expect(appController.healthCheck()).toBe("Hello World!"); // FAILS - returns "healthy"
});
```

### Minimal Test Coverage

- Only 1 test file in frontend: `create-store.test.ts`
- Only 1 test file in backend: `app.controller.spec.ts` (stale)
- No other tests exist for:
  - Use cases
  - Repositories
  - React components
  - Hooks
  - API endpoints

---

## Test Patterns to Adopt

Based on existing code structure, recommended patterns:

### Backend Use-Case Tests

```typescript
describe("CreateBankAccountUseCase", () => {
  it("should create a bank account with valid input", async () => {
    // Arrange
    const mockRepository = {
      create: vi.fn().mockResolvedValue(bankAccount),
    };
    const useCase = new CreateBankAccountUseCase(mockRepository);

    // Act
    const result = await useCase.execute(validInput);

    // Assert
    expect(result.isSuccess).toBe(true);
  });
});
```

### Frontend Hook Tests

```typescript
describe("useAddAccount", () => {
  it("should create account on submit", async () => {
    const { result } = renderHook(() => useAddAccount());
    
    await act(async () => {
      await result.current.mutateAsync(validData);
    });

    expect(apiClient.post).toHaveBeenCalledWith("/bank-accounts", validData);
  });
});
```

### Integration Tests (Backend)

```typescript
describe("BankAccountsController (e2e)", () => {
  it("POST /bank-accounts should create account", async () => {
    const app = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    const server = supertest(app.getHttpServer());
    const response = await server
      .post("/api/bank-accounts")
      .set("Authorization", "Bearer valid-token")
      .send(validAccountData);

    expect(response.status).toBe(201);
  });
});
```