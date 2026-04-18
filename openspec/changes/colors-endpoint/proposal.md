# Proposal: GET /api/colors endpoint

## Summary

Create a `colors` module in the API that serves a static list of available colors via `GET /api/colors`. The frontend already calls this endpoint (`apps/web/src/pages/home/api/colors.ts`) and expects `{ id: string; name: string }[]`. These colors are used in the "Add Account" form to let users choose a color swatch for their bank accounts.

## Motivation

The frontend's `useListColors()` hook (via `colorsQueryFactory.listColors()`) calls `GET /api/colors` but the backend has no handler for this route. This causes a runtime error when users open the "Add Account" dialog. Unblocking this endpoint is required for the bank account creation flow to work end-to-end.

## Key Decisions

### 1. Static data, no database table

Colors are a finite, predetermined palette — the same 15 colors that exist in the design system as SVG icon components (`packages/design-system/src/components/ui/icons/colors.tsx`). There is no user-created data, no per-user customization, and no CRUD operations. Storing them in PostgreSQL would add migration overhead and a database hit for data that never changes.

**Decision:** Define colors as a `const` object in the controller (same pattern as `ListAccountTypesController` at `apps/api/src/modules/bank-accounts/presentation/list-account-types.controller.ts`).

### 2. Minimal module — controller only

Since the data is static and requires no repository, entity, or use-case, the module structure is minimal: one module file + one controller. No `domain/`, `application/`, or `infra/` layers needed. This follows the precedent set by `ListAccountTypesController`, which also serves static enum-like data with zero infrastructure.

### 3. Response shape: `{ id: string; name: string }[]`

The frontend `Color` type is `{ id: string; name: string }` (see `apps/web/src/pages/home/api/colors.ts:4-7`). The `id` maps to the lowercase design-system color name (e.g., `"gray"`, `"green"`, `"indigo"`) — the same value used by `getColorIcon()` to look up the corresponding SVG component. The `name` is the display label (e.g., `"Gray"`, `"Green"`, `"Indigo"`).

### 4. No pagination

15 items. Fixed palette. No pagination needed.

### 5. Auth-protected (default)

The endpoint is behind the global auth guard (default behavior). The frontend sends the session token. No `@AllowAnonymous()` needed.

## Scope

- **In scope:** `GET /api/colors` returning the 15-color palette
- **Out of scope:** Color CRUD, user-custom colors, database persistence, hex codes in response (frontend resolves colors via design-system icons, not hex values)

## Risks

- **None significant.** This is a straightforward static-list endpoint with an established pattern (`ListAccountTypesController`). The color list is derived from the design system's icon exports, which are stable.

## Frontend Contract

```typescript
// apps/web/src/pages/home/api/colors.ts
export type Color = { id: string; name: string };
// GET /api/colors → Color[]
```

The `id` values must match the lowercase icon function names from `packages/design-system/src/components/ui/icons/colors.tsx`:
`gray`, `green`, `indigo`, `red`, `black`, `lime`, `blue`, `pink`, `white`, `yellow`, `cyan`, `grape`, `orange`, `teal`, `purple`
