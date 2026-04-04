---
name: fincheck-tooling
description: Monorepo tooling - Bun workspace setup, Turborepo pipeline, Biome config, Docker Compose, Terraform LocalStack, shell scripts
---

# Fincheck Tooling

Monorepo build, lint, and infrastructure tooling configuration.

## Bun Workspace

**Package manager:** Bun 1.2.23 (`packageManager` in root package.json)

**Workspaces:** `apps/*` + `packages/*`

**Commands:**
- `bun install` — Install all workspace deps
- `bun run --filter @fincheck/api dev` — Run specific package script

**bunfig.toml:** Static serve env prefix `BUN_PUBLIC_*`

## Turborepo

**File:** `turbo.json`

| Task | Config | Meaning |
|---|---|---|
| `build` | `dependsOn: ["^build"]`, outputs `.next/**` | Topological — builds deps first |
| `//#lint` | `{}` | Root-only task (the `//` prefix) |
| `//#format` | `cache: false` | Root-only, never cached |
| `check-types` | `dependsOn: ["^check-types"]` | Topological type-check |
| `dev` | `cache: false`, `persistent: true` | Dev servers, runs forever |

**Key:** `//#` prefix = root workspace only (runs from root package.json, not per-package)

**Usage:**
```bash
turbo dev             # All dev servers
turbo build           # Topological build
turbo check-types     # Type-check all
```

## Biome

**Root config:** `biome.json`

| Rule | Value | Impact |
|---|---|---|
| `indentStyle` | `tab` | Tabs for all code |
| `quoteStyle` | `double` | Double quotes for strings |
| `useImportType` | `error` | Force `import type` for types |
| `noEnum` | `error` | Enums banned — use `as const` or unions |
| `noDefaultExport` | `error` | Default exports banned |
| `noMagicNumbers` | `error` | Extract numbers to named constants |
| `noNestedTernary` | `error` | No ternary inside ternary |
| `organizeImports` | `on` | Auto-sort imports |

**API override:** `apps/api/biome.json` sets `useImportType: "off"` (NestJS decorators need runtime imports)

**Commands:**
```bash
bun run lint      # Check all
bun run format    # Fix all
```

## Docker Compose

**File:** `docker-compose.yml`

| Service | Image | Port | Health Check |
|---|---|---|---|
| postgres | postgres:15-alpine | 5432 | `pg_isready` every 5s |
| redis | redis:7-alpine | 6379 | `redis-cli ping` every 5s |
| api | Built from `./infra/docker/api/Dockerfile` | 3333 | Custom health-check.js |

**API Dockerfile:** 3-stage build (base → builder → production)
- Base: Bun 1.3.5, installs all deps
- Builder: Builds NestJS
- Production: Copies dist/, prod-only deps, non-root user, runs `main.js`

**Health check:** HTTP GET to `localhost:3333/api/health-check` every 30s

## Terraform + LocalStack

**Provider:** AWS targeting `http://localhost:4566` (LocalStack)

**4 modules:**

| Module | Purpose |
|---|---|
| `networking` | VPC, subnets, security groups |
| `database` | RDS instance |
| `ecs` | Fargate cluster + ALB |
| `monitoring` | CloudWatch logs/alarms |

**Backend:** S3 state bucket on LocalStack

**Environment:** `environments/local/terraform.tfvars`

## Shell Scripts

**Location:** `infra/scripts/`

| Script | Purpose |
|---|---|
| `check-dependencies.sh` | Validates Docker, AWS CLI, Terraform, Bun installed + ports free |
| `setup-localstack.sh` | Bootstrap: starts LocalStack, creates S3 bucket, terraform init, builds API image |
| `build-containers.sh` | Builds `fincheck-api:latest`, runs smoke test |
| `build-frontend.sh` | Builds web app, gzip assets, copies to `deploy/frontend/` |
| `deploy.sh` | Full pipeline: terraform apply, wait for ECS health |
| `teardown.sh` | Destructive: terraform destroy, removes LocalStack, cleans Docker |

**Execution order:** `check-dependencies.sh` → `setup-localstack.sh` → `deploy.sh`

## Mock Server

**Command:** `bun run server`

**Config:**
- `server.json` — Mock data
- `routes.json` — Route rewrites
- Port: 8000
- Uses `json-server-auth` for auth endpoints

## TypeScript Configs

**Package:** `@fincheck/ts-config`

| Config | Extends | Use |
|---|---|---|
| `base.json` | — | Strict base for all |
| `node.json` | base | NestJS (decorators on, verbatimModuleSyntax off) |
| `react.json` | base | Vite (bundler resolution, JSX, @/* alias) |

## Git

**Hooks:** None configured (no Husky, no lint-staged)

**.gitignore:** node_modules, dist, .env*, coverage, .turbo, .next

## Caveats

- No CI/CD pipeline yet
- No git hooks — linting not enforced pre-commit
- Test configs are mixed (Vitest primary, Jest legacy remains)
