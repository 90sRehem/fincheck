# Design: color-id-migration

## Visao Geral

Inverter a direcao do mapeamento: frontend envia `color.id` (ex: `"green"`) em vez de `color.hex` (ex: `"#40C057"`), backend valida como string simples e persiste o ID. O response da API tambem retorna o ID (nao hex). O frontend ja possui o mapeamento `id -> hex` via `GET /api/v1/colors`.

## Mudancas por Arquivo

### Frontend

#### 1. `apps/web/src/pages/home/ui/add-accounts.tsx`

**Linha 206 — Select.Item value:**
```
Antes:  value={color.hex}
Depois: value={color.id}
```

O formulario passa a armazenar o ID da cor como valor do campo `color`. O icon (linha 204) ja usa `color.id` — fica consistente.

**Linha 94 — handleSubmit:**
Nenhuma mudanca necessaria. `data.color` ja e o value do Select, que passara a ser o ID.

#### 2. `apps/web/src/pages/home/api/accounts.ts`

**Tipo `CreateAccountRequest`:**
O campo `color: string` continua como esta. O tipo nao muda — apenas a semantica do valor (de hex para id).

**Tipo `Account`:**
O campo `color: string` no response tambem nao muda. O frontend que consome precisa saber que agora recebe um ID.

#### 3. `apps/web/src/pages/home/ui/acounts-list.tsx`

**Linha 31:**
```
Antes:  color={account.color as Colors}
```
Atualmente faz cast de hex para `Colors` (type alias com nomes como `"green"`). Apos a migracao, `account.color` JA sera `"green"`, entao o cast continua funcionando — mas agora esta semanticamente correto.

**Nenhuma mudanca de codigo necessaria** neste arquivo, mas o cast `as Colors` passara a ser correto em vez de acidental.

#### 4. `apps/web/src/pages/home/model/add-account-schema.ts`

**Nenhuma mudanca necessaria.** O schema Zod frontend valida `color: z.string().min(1)` — aceita qualquer string nao vazia. Funciona tanto com hex quanto com ID.

### Backend

#### 5. `apps/api/src/modules/bank-accounts/application/create-bank-account/create-bank-account.dto.ts`

**Linhas 6, 26-29 — Remover validacao hex:**
```typescript
// Antes
const HEX_COLOR_LENGTH = 7;
color: z
  .string()
  .length(HEX_COLOR_LENGTH, "color must be a valid hex color (#RRGGBB)")
  .regex(/^#[0-9A-Fa-f]{6}$/, "color must be a valid hex color (#RRGGBB)"),

// Depois
color: z.string().min(1, "color is required"),
```
Remover constante `HEX_COLOR_LENGTH`.

#### 6. `apps/api/src/modules/bank-accounts/application/update-bank-account/update-bank-account.dto.ts`

**Linhas 6, 29-33 — Mesma mudanca do create:**
```typescript
// Antes
const HEX_COLOR_LENGTH = 7;
color: z
  .string()
  .length(HEX_COLOR_LENGTH, "color must be a valid hex color (#RRGGBB)")
  .regex(/^#[0-9A-Fa-f]{6}$/, "color must be a valid hex color (#RRGGBB)")
  .optional(),

// Depois
color: z.string().min(1, "color is required").optional(),
```
Remover constante `HEX_COLOR_LENGTH`.

#### 7. `apps/api/src/modules/bank-accounts/domain/validators/bank-account.validator.ts`

**Linhas 7, 47-53 — Remover validacao hex no validator de dominio:**
```typescript
// Antes
const HEX_COLOR_LENGTH = 7;
color: z
  .string()
  .length(HEX_COLOR_LENGTH, "color must be a valid hex color (#RRGGBB)")
  .regex(/^#[0-9A-Fa-f]{6}$/, "color must be a valid hex color (#RRGGBB)"),

// Depois
color: z.string().min(1, "color is required"),
```
Remover constante `HEX_COLOR_LENGTH`.

#### 8. `apps/api/src/modules/bank-accounts/presentation/create-bank-account.controller.ts`

**Linhas 60-65 — Swagger schema:**
```typescript
// Antes
color: {
  type: "string",
  pattern: "^#[0-9A-Fa-f]{6}$",
  example: "#8B5CF6",
  description: "Cor em formato hexadecimal (#RRGGBB)",
},

// Depois
color: {
  type: "string",
  example: "indigo",
  description: "ID da cor (referencia tabela colors)",
},
```

#### 9. `apps/api/src/modules/bank-accounts/presentation/update-bank-account.controller.ts`

**Linhas 71-75 — Swagger schema:**
```typescript
// Antes
color: {
  type: "string",
  pattern: "^#[0-9A-Fa-f]{6}$",
  example: "#10B981",
},

// Depois
color: {
  type: "string",
  example: "green",
  description: "ID da cor (referencia tabela colors)",
},
```

### Arquivos SEM mudanca (confirmados)

| Arquivo | Motivo |
|---------|--------|
| `bank-account-schema.ts` | Coluna `color: text` continua — muda apenas conteudo |
| `bank-account.entity.ts` | Getter `get color()` retorna `string` — tipo nao muda |
| `bank-account.mapper.ts` | Mapeia `color: raw.color` e `color: entity.color` — string para string |
| `create-bank-account.use-case.ts` | Recebe `color` como string do input — tipo nao muda |
| `use-add-account.ts` | Chama `createAccount()` com dados do form — nao manipula color |
| `add-account-schema.ts` | Valida `color: z.string().min(1)` — ja aceita IDs |
| `accounts.ts` (api) | Tipo `CreateAccountRequest.color: string` — semantica muda mas tipo nao |

## Diagrama de Fluxo (Apos Migracao)

```
GET /api/v1/colors
  -> [{ id: "green", name: "Verde", hex: "#40C057" }, ...]

Frontend Select:
  value={color.id}  ("green")
  icon: getColorIcon(color.id)

POST /api/v1/bank-accounts
  body: { name, type, color: "green", initialBalance }

Backend:
  DTO: z.string().min(1)  -> aceita "green"
  Entity: validator aceita string simples
  DB: INSERT ... color = "green"

GET /api/v1/bank-accounts
  response: { color: "green", ... }

Frontend CardLarge:
  color={account.color as Colors}  -> "green" (correto!)
```

## Riscos

1. **Dados existentes** — Contas ja criadas tem hex na coluna `color`. O response enviara hex para essas contas, e o cast `as Colors` falhara silenciosamente (nao e um Colors valido). Mitigacao: script de correcao futuro ou handle no frontend.
2. **Transactions** — O arquivo `transaction.tsx:19` usa `transaction.color`. Se transactions tambem persistem hex, precisam da mesma migracao. Fora de escopo desta change (transactions e outro modulo).
