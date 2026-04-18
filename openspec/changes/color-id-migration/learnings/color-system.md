# Color System — Bank Accounts

**Data:** 2026-04-18  
**Contexto:** Bug corrigido ao criar conta bancária (color id vs hex)

## Fluxo End-to-End

```
GET /api/v1/colors
  └─ Retorna: [{ id: "indigo", name: "Indigo", hex: "#4C6EF5" }, ...]

Frontend (add-accounts.tsx)
  └─ Select.Item value={color.hex}  ← CORRETO (era color.id antes do fix)
  └─ Submit: { name, type, color: "#4C6EF5", initialBalance }
       └─ POST /api/v1/bank-accounts

Backend
  └─ DTO valida: z.string().length(7).regex(/^#[0-9A-Fa-f]{6}$/)
  └─ Persiste hex direto na coluna color (não FK)
```

## Tabela `colors` (lookup imutável)

| Campo | Tipo     | Exemplo     |
|-------|----------|-------------|
| id    | text PK  | `"indigo"`  |
| name  | text     | `"Indigo"`  |
| hex   | text     | `"#4C6EF5"` |

Schema: `apps/api/src/modules/colors/infra/drizzle/schemas/color-schema.ts`

## Armazenamento em bank_accounts

- Coluna `color` armazena **hex string diretamente** (não FK para tabela colors)
- DTO: `apps/api/src/modules/bank-accounts/application/create-bank-account/create-bank-account.dto.ts:26-29`
- Mesmo padrão esperado em transactions

## Ícones de Cor (Frontend)

- Mapeamento visual usa `color.id` (ex: `"indigo"`) para buscar componente de ícone
- Arquivo: `apps/web/src/pages/home/lib/get-color-icon.ts`
- **Importante:** `id` é usado apenas para exibição do ícone — o `hex` é o que vai no payload

## Bug Corrigido (2026-04-18)

**Problema:** `apps/web/src/pages/home/ui/add-accounts.tsx:206` enviava `value={color.id}` no Select.Item  
**Efeito:** Backend recebia `{ color: "indigo" }` → validação Zod falhava → 400 Bad Request  
**Fix:** Alterado para `value={color.hex}` → backend recebe `{ color: "#4C6EF5" }` ✓

## Arquivos Relevantes

| Arquivo | Responsabilidade |
|---------|-----------------|
| `apps/api/src/modules/colors/infra/drizzle/schemas/color-schema.ts` | Schema Drizzle tabela colors |
| `apps/api/src/modules/colors/presentation/list-colors.controller.ts` | GET /api/v1/colors |
| `apps/api/src/modules/bank-accounts/application/create-bank-account/create-bank-account.dto.ts:26-29` | Validação hex |
| `apps/web/src/pages/home/api/colors.ts` | HTTP client listColors() |
| `apps/web/src/pages/home/model/use-list-colors.ts` | React Query hook |
| `apps/web/src/pages/home/ui/add-accounts.tsx:203-206` | Color Select (fix aplicado) |
| `apps/web/src/pages/home/lib/get-color-icon.ts` | Ícone visual por color.id |

## Regras para Futuros Devs

- Ao criar/editar bank-accounts ou transactions: **sempre envie `color.hex`**, nunca `color.id`
- O backend **nunca aceita** nomes CSS (`"lime"`, `"teal"`) — apenas hex `#RRGGBB`
- Icons usam `color.id` mas payload usa `color.hex` — são responsabilidades distintas
