# Tasks: colors-endpoint

## Task 1 — Add ColorResponseSchema to shared Swagger schemas
**Status:** pending
**File:** `apps/api/src/shared/swagger/schemas.ts`
**Action:** edit (append)
**Details:**
Add a `ColorResponseSchema` constant at the end of the file, following the same pattern as `AccountTypeResponseSchema`:
```typescript
export const ColorResponseSchema: SchemaObject = {
  type: "object",
  properties: {
    id: { type: "string", example: "indigo" },
    name: { type: "string", example: "Indigo" },
  },
};
```
**Acceptance:**
- `ColorResponseSchema` exported from `schemas.ts`
- Shape matches `{ id: string, name: string }`

---

## Task 2 — Create list-colors controller
**Status:** pending
**File:** `apps/api/src/modules/colors/presentation/list-colors.controller.ts` (create)
**Action:** create
**Details:**
Create the controller following the `ListAccountTypesController` pattern exactly:
- Define a `COLORS` const array with the 15 colors: `gray`, `green`, `indigo`, `red`, `black`, `lime`, `blue`, `pink`, `white`, `yellow`, `cyan`, `grape`, `orange`, `teal`, `purple` — each as `{ id: string, name: string }`
- `@Controller("colors")` route prefix
- `@ApiTags("Colors")` + `@ApiCookieAuth("better-auth.session_token")`
- Single `@Get()` method named `list()` that returns the array directly
- `@ApiOperation` with summary "List Colors" and description
- `@ApiResponse` 200 with schema `{ type: "array", items: ColorResponseSchema }`
- `@ApiResponse` 401 with `UnauthorizedErrorSchema`
- Import `ColorResponseSchema` and `UnauthorizedErrorSchema` from `@/shared/swagger/schemas`

**Acceptance:**
- `GET /api/colors` returns the 15-item `{ id, name }[]` array
- Swagger docs render correctly
- Auth is enforced (no `@AllowAnonymous()`)

---

## Task 3 — Create colors module
**Status:** pending
**File:** `apps/api/src/modules/colors/colors.module.ts` (create)
**Action:** create
**Details:**
Create a minimal NestJS module:
- `@Module({ controllers: [ListColorsController] })`
- Export `ColorsModule` class
- Import `ListColorsController` from `./presentation/list-colors.controller`

**Acceptance:**
- Module compiles without errors
- Controller is registered in the module

---

## Task 4 — Register ColorsModule in AppModule
**Status:** pending
**File:** `apps/api/src/app.module.ts`
**Action:** edit
**Details:**
- Add import: `import { ColorsModule } from "./modules/colors/colors.module";`
- Add `ColorsModule` to the `imports` array (after `BalancesModule`)

**Acceptance:**
- `ColorsModule` listed in `AppModule` imports
- `turbo check-types --filter @fincheck/api` passes
- `GET /api/colors` responds with 200 and the color array when the server is running

---

## Task 5 — Verify end-to-end (manual)
**Status:** pending
**File:** n/a
**Action:** verify
**Details:**
- Start the API: `bun run --filter @fincheck/api dev`
- Confirm `GET /api/colors` with valid auth returns the 15-color array
- Confirm `GET /api/colors` without auth returns 401
- Confirm Swagger docs at `/api/docs` show the Colors tag

**Acceptance:**
- 200 response with exact 15 colors matching design-system icon names
- 401 response for unauthenticated requests
- Swagger documentation renders Colors section
