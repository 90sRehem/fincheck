# Tasks: color-id-migration

## Fase 1 — Backend: Remover validacao hex

- [ ] 1.1 Atualizar create DTO (`apps/api/src/modules/bank-accounts/application/create-bank-account/create-bank-account.dto.ts`)
  - Files: `create-bank-account.dto.ts`
  - Mudanca: Remover constante `HEX_COLOR_LENGTH` (linha 6). Substituir validacao `color` (linhas 26-29) de `.length(7).regex(...)` para `.min(1, "color is required")`
  - Acceptance: DTO aceita `{ color: "green" }` e rejeita `{ color: "" }`

- [ ] 1.2 Atualizar update DTO (`apps/api/src/modules/bank-accounts/application/update-bank-account/update-bank-account.dto.ts`)
  - Files: `update-bank-account.dto.ts`
  - Mudanca: Remover constante `HEX_COLOR_LENGTH` (linha 6). Substituir validacao `color` (linhas 29-33) de `.length(7).regex(...).optional()` para `.min(1, "color is required").optional()`
  - Acceptance: DTO aceita `{ color: "indigo" }` e `{}` (optional), rejeita `{ color: "" }`

- [ ] 1.3 Atualizar domain validator (`apps/api/src/modules/bank-accounts/domain/validators/bank-account.validator.ts`)
  - Files: `bank-account.validator.ts`
  - Mudanca: Remover constante `HEX_COLOR_LENGTH` (linha 7). Substituir validacao `color` (linhas 47-53) de `.length(7).regex(...)` para `.min(1, "color is required")`
  - Acceptance: Entity valida `color: "green"` como valido, rejeita string vazia

## Fase 2 — Backend: Atualizar Swagger docs

- [ ] 2.1 Atualizar Swagger do create controller (`apps/api/src/modules/bank-accounts/presentation/create-bank-account.controller.ts`)
  - Files: `create-bank-account.controller.ts`
  - Mudanca: No `@ApiBody` schema (linhas 60-65), remover `pattern`, trocar `example` de `"#8B5CF6"` para `"indigo"`, alterar `description` para `"ID da cor (referencia tabela colors)"`
  - Acceptance: Swagger UI mostra exemplo `"indigo"` e descricao atualizada

- [ ] 2.2 Atualizar Swagger do update controller (`apps/api/src/modules/bank-accounts/presentation/update-bank-account.controller.ts`)
  - Files: `update-bank-account.controller.ts`
  - Mudanca: No `@ApiBody` schema (linhas 71-75), remover `pattern`, trocar `example` de `"#10B981"` para `"green"`, adicionar `description: "ID da cor (referencia tabela colors)"`
  - Acceptance: Swagger UI mostra exemplo `"green"` e descricao atualizada

## Fase 3 — Frontend: Enviar ID em vez de hex

- [ ] 3.1 Alterar Select value no formulario de adicionar conta (`apps/web/src/pages/home/ui/add-accounts.tsx`)
  - Files: `add-accounts.tsx`
  - Mudanca: Linha 206, trocar `value={color.hex}` para `value={color.id}`
  - Acceptance: Ao selecionar uma cor no form, o valor armazenado no campo e o ID (ex: `"green"`) e nao o hex (ex: `"#40C057"`)

## Fase 4 — Verificacao

- [ ] 4.1 Verificar tipos (`turbo check-types`)
  - Acceptance: Sem erros de tipo em todo o monorepo

- [ ] 4.2 Verificar lint (`bun run lint`)
  - Acceptance: Sem erros de lint

## Resumo de Arquivos

| Arquivo | Fase | Tipo de Mudanca |
|---------|------|-----------------|
| `apps/api/.../create-bank-account.dto.ts` | 1.1 | Remover hex regex |
| `apps/api/.../update-bank-account.dto.ts` | 1.2 | Remover hex regex |
| `apps/api/.../bank-account.validator.ts` | 1.3 | Remover hex regex |
| `apps/api/.../create-bank-account.controller.ts` | 2.1 | Swagger example |
| `apps/api/.../update-bank-account.controller.ts` | 2.2 | Swagger example |
| `apps/web/.../add-accounts.tsx` | 3.1 | Select value |
