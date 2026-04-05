# @fincheck/ts-config — Shared TypeScript Configurations

Shared TypeScript configurations for the monorepo (base, node, react).

## Configs

| File | Extends | Use Case | Key Settings |
|---|---|---|---|
| **base.json** | — | Strict foundation for all packages | ES2022, strict mode, noUncheckedIndexedAccess, verbatimModuleSyntax, isolatedModules |
| **node.json** | base | NestJS/Node backend | NodeNext resolution, decorators enabled, **verbatimModuleSyntax OFF** |
| **react.json** | base | React frontend | Bundler resolution, JSX, `@/*` path alias |

**Why `verbatimModuleSyntax: false` in node.json?** NestJS DI requires runtime imports for injectable classes — the `import type` restriction from base.json breaks NestJS decorators.

## Usage in Apps/Packages

**Backend (apps/api):**
```json
{ "extends": "@fincheck/ts-config/node.json" }
```

**Frontend (apps/web, packages/design-system):**
```json
{ "extends": "@fincheck/ts-config/react.json" }
```

**Custom package (if needed):**
```json
{
  "extends": "@fincheck/ts-config/base.json",
  "compilerOptions": { /* add custom overrides */ }
}
```

## Impact Assessment Rule

**CRITICAL:** Changes to these configs affect ALL packages in the monorepo.

Before modifying:
1. Run `turbo check-types` to get baseline
2. Make the change
3. Run `turbo check-types` again
4. Fix all type errors in all packages before committing

Never commit a change that breaks type checking in any package.
