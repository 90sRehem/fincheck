# Design: fix-userid-session

## Decisão 1: Tipo compartilhado `AuthSession`

### Contexto

A biblioteca `@thallesp/nestjs-better-auth` exporta dois tipos relevantes:

```ts
// node_modules/@thallesp/nestjs-better-auth/dist/index.d.ts
type BaseUserSession = NonNullable<Awaited<ReturnType<ReturnType<typeof getSession>>>>;
type UserSession = BaseUserSession & {
  user: BaseUserSession["user"] & { role?: string | string[] };
  session: BaseUserSession["session"] & { activeOrganizationId?: string };
};
```

O `UserSession` é genérico demais (inclui campos de plugins opcionais como `role`, `activeOrganizationId`). O projeto precisa de um tipo enxuto que represente o subset que os controllers realmente consomem.

### Opções consideradas

| Opção | Prós | Contras |
|-------|------|---------|
| A) Re-exportar `UserSession` diretamente | Zero código novo | Expõe campos de plugins não usados, acoplamento direto à lib |
| B) Criar `AuthSession` com `Pick` de `UserSession` | Type-safe, desacoplado | Precisa manter sincronizado |
| **C) Criar `AuthSession` como tipo próprio simples** | **Desacoplado, enxuto, explícito** | **Mínimo overhead** |

### Decisão: Opção C

Criar um tipo próprio que documenta exatamente o que o projeto usa:

```ts
// apps/api/src/core/auth/types.ts
export type AuthSession = {
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
    createdAt: Date;
    updatedAt: Date;
  };
  session: {
    id: string;
    userId: string;
    token: string;
    expiresAt: Date;
  };
};
```

**Rationale:** O tipo próprio serve como barreira anti-corrupção (ACL) — se a lib mudar a estrutura do `UserSession`, o type-check quebrará no ponto certo (`types.ts`) em vez de em N controllers espalhados.

## Decisão 2: Local do tipo

**Arquivo:** `apps/api/src/core/auth/types.ts`

Justificativa:
- `core/auth/` já concentra toda configuração de autenticação
- O barrel `core/auth/index.ts` já existe e exporta `AuthModule` — basta adicionar o tipo
- Segue o padrão existente de co-locação no core

## Decisão 3: Padrão de acesso ao userId

Todos os controllers passarão a usar:

```ts
async method(@Session() session: AuthSession) {
  const userId = session.user.id;
  // ...
}
```

**Import:** `import type { AuthSession } from "@/core/auth";`

Nota: O `CreateBankAccountController` já usa `session.user.id` mas com tipo inline — será normalizado para usar `AuthSession` também.

## Decisão 4: Import `type` vs runtime import

Usar `import type { AuthSession }` (não `import { AuthSession }`) pois:
- `AuthSession` é apenas um tipo, não tem valor runtime
- Respeita `verbatimModuleSyntax` do tsconfig base
- **Exceção:** O `biome.json` do API tem `useImportType: off` para classes injetáveis, mas tipos puros devem usar `import type` por boa prática

## Arquivos afetados

| Arquivo | Mudança |
|---------|---------|
| `apps/api/src/core/auth/types.ts` | **NOVO** — define `AuthSession` |
| `apps/api/src/core/auth/index.ts` | Adiciona re-export do tipo |
| `apps/api/src/modules/transactions/presentation/transactions.controller.ts` | 5 ocorrências: `{ userId: string }` → `AuthSession`, `session.userId` → `session.user.id` |
| `apps/api/src/modules/balances/presentation/get-user-balances.controller.ts` | 1 ocorrência |
| `apps/api/src/modules/bank-accounts/presentation/delete-bank-account.controller.ts` | 1 ocorrência |
| `apps/api/src/modules/bank-accounts/presentation/update-bank-account.controller.ts` | 1 ocorrência |
| `apps/api/src/modules/bank-accounts/presentation/list-bank-accounts.controller.ts` | 1 ocorrência |
| `apps/api/src/modules/bank-accounts/presentation/create-bank-account.controller.ts` | Normalizar tipo inline → `AuthSession` (já usa `session.user.id`) |
