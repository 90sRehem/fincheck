# Tasks: fix-userid-session

## 1. Criar tipo AuthSession

- [x] 1.1 Criar arquivo de tipos (`apps/api/src/core/auth/types.ts`)
  - Files: `apps/api/src/core/auth/types.ts` (NOVO)
  - Ação: Definir `AuthSession` com shape `{ user: { id, name, email, image, createdAt, updatedAt }, session: { id, userId, token, expiresAt } }`
  - Acceptance: Arquivo existe, tipo é exportado, sem `enum`, sem dependência de `@thallesp/nestjs-better-auth`

- [x] 1.2 Atualizar barrel de auth (`apps/api/src/core/auth/index.ts`)
  - Files: `apps/api/src/core/auth/index.ts`
  - Ação: Adicionar `export type { AuthSession } from "./types"` ao barrel existente
  - Acceptance: `import type { AuthSession } from "@/core/auth"` funciona em qualquer controller

## 2. Corrigir controllers de bank-accounts

- [x] 2.1 Corrigir `CreateBankAccountController` — normalizar tipo inline para `AuthSession` (`apps/api/src/modules/bank-accounts/presentation/create-bank-account.controller.ts`)
  - Files: `apps/api/src/modules/bank-accounts/presentation/create-bank-account.controller.ts`
  - Ação: Substituir `session: { user: { id: string } }` por `session: AuthSession`; adicionar `import type { AuthSession } from "@/core/auth"`; manter acesso `session.user.id` (já correto)
  - Acceptance: Tipo é `AuthSession`, import type presente, `session.user.id` mantido

- [x] 2.2 Corrigir `ListBankAccountsController` (`apps/api/src/modules/bank-accounts/presentation/list-bank-accounts.controller.ts`)
  - Files: `apps/api/src/modules/bank-accounts/presentation/list-bank-accounts.controller.ts`
  - Ação: Substituir `session: { userId: string }` por `session: AuthSession`; trocar `session.userId` por `session.user.id`; adicionar `import type { AuthSession } from "@/core/auth"`
  - Acceptance: Tipo é `AuthSession`, acesso via `session.user.id`, type-check passa

- [x] 2.3 Corrigir `UpdateBankAccountController` (`apps/api/src/modules/bank-accounts/presentation/update-bank-account.controller.ts`)
  - Files: `apps/api/src/modules/bank-accounts/presentation/update-bank-account.controller.ts`
  - Ação: Substituir `session: { userId: string }` por `session: AuthSession`; trocar `session.userId` por `session.user.id`; adicionar `import type { AuthSession } from "@/core/auth"`
  - Acceptance: Tipo é `AuthSession`, acesso via `session.user.id`, type-check passa

- [x] 2.4 Corrigir `DeleteBankAccountController` (`apps/api/src/modules/bank-accounts/presentation/delete-bank-account.controller.ts`)
  - Files: `apps/api/src/modules/bank-accounts/presentation/delete-bank-account.controller.ts`
  - Ação: Substituir `session: { userId: string }` por `session: AuthSession`; trocar `session.userId` por `session.user.id`; adicionar `import type { AuthSession } from "@/core/auth"`
  - Acceptance: Tipo é `AuthSession`, acesso via `session.user.id`, type-check passa

## 3. Corrigir controller de transactions

- [x] 3.1 Corrigir `TransactionsController` — 5 métodos (`apps/api/src/modules/transactions/presentation/transactions.controller.ts`)
  - Files: `apps/api/src/modules/transactions/presentation/transactions.controller.ts`
  - Ação: Adicionar `import type { AuthSession } from "@/core/auth"`; substituir todas as 5 ocorrências de `session: { userId: string }` por `session: AuthSession`; trocar todos os `session.userId` por `session.user.id` (métodos: create, list, getById, update, delete)
  - Acceptance: 0 ocorrências de `{ userId: string }`, 0 ocorrências de `session.userId`, todas usando `AuthSession` + `session.user.id`

## 4. Corrigir controller de balances

- [x] 4.1 Corrigir `GetUserBalancesController` (`apps/api/src/modules/balances/presentation/get-user-balances.controller.ts`)
  - Files: `apps/api/src/modules/balances/presentation/get-user-balances.controller.ts`
  - Ação: Substituir `session: { userId: string }` por `session: AuthSession`; trocar `session.userId` por `session.user.id`; adicionar `import type { AuthSession } from "@/core/auth"`
  - Acceptance: Tipo é `AuthSession`, acesso via `session.user.id`, type-check passa

## 5. Verificação final

- [x] 5.1 Rodar type-check no monorepo
  - Ação: Executar `turbo check-types --filter=@fincheck/api`
  - Acceptance: 0 erros de tipo

- [x] 5.2 Verificar que nenhum controller usa `session.userId` diretamente
  - Ação: `grep -r "session\.userId" apps/api/src/` deve retornar 0 resultados
  - Acceptance: 0 ocorrências de `session.userId` no código-fonte dos controllers
