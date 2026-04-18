## Context

A tabela `bank_accounts` armazena três campos como valores "soltos":
- `color` — hex string (`"#40C057"`), validado por regex no DTO e entity
- `type` — pgEnum `bank_account_type` com 5 valores fixos no schema
- `currency` — text livre com default `"BRL"`, validado apenas por length = 3

As lookup tables `colors` (id, name, hex) e `account_types` (id, name) já existem como tabelas separadas com módulos DDD completos, servidas por endpoints `GET /colors` e `GET /account-types`. A tabela `currencies` não existe.

O frontend já carrega colors e account_types via React Query e usa os IDs para renderização visual, mas envia hex/string no payload de criação de conta.

### Estado atual do schema

```
bank_accounts
├── color: text           ← armazena hex "#40C057"
├── type: bank_account_type (pgEnum)  ← "checking" | "savings" | ...
└── currency: text        ← "BRL" (free text)
```

```
colors (id: text PK, name: text, hex: text)
account_types (id: text PK, name: text)
currencies  ← NÃO EXISTE
```

## Goals / Non-Goals

**Goals:**
- Substituir `color`, `type` e `currency` por FKs para lookup tables
- Criar tabela `currencies` com módulo DDD completo
- Retornar objetos ricos na API response (`color: { id, name, hex }` ao invés de `color: "#hex"`)
- Migrar dados existentes preservando integridade referencial
- Remover pgEnum `bank_account_type` (dados vivem na tabela)

**Non-Goals:**
- CRUD de colors/account_types/currencies (apenas leitura; admin CRUD é futuro)
- Suporte multi-currency avançado (conversão, taxas de câmbio)
- Versionamento da API (v2) — esta é uma breaking change no v1, aceitável dado estágio early do projeto
- Alterar a tabela `transactions` (também tem `color: text`, mas é escopo separado)
- Alterar a tabela `balances` (também tem `currency: text`, escopo separado)

## Decisions

### D1: FK para text ID (não UUID)

**Decisão:** FKs referenciam `text` primary keys das lookup tables (e.g., `"indigo"`, `"checking"`, `"BRL"`).

**Rationale:** Padrão estabelecido — `colors.id` e `account_types.id` já usam IDs determinísticos legíveis. Mantém consistência. UUIDs seriam overhead desnecessário para dados estáticos do sistema.

**Alternativa descartada:** Adicionar coluna UUID nas lookup tables e usar como FK. Rejeitado: complexidade desnecessária, IDs legíveis facilitam debugging e seeds.

### D2: Nomes das colunas FK

**Decisão:** `color_id`, `account_type_id`, `currency_id` (snake_case com sufixo `_id`).

**Rationale:** Padrão Drizzle/PostgreSQL. Consistente com `user_id` já existente na tabela. Mapeia para `colorId`, `accountTypeId`, `currencyId` no TypeScript via camelCase.

### D3: Currencies usa ISO 4217 code como ID

**Decisão:** `currencies` table com `id` = código ISO 4217 (e.g., `"BRL"`, `"USD"`, `"EUR"`).

**Rationale:** Códigos ISO são únicos, estáveis e universalmente reconhecidos. Consistente com o padrão de IDs determinísticos das outras lookup tables. O campo atual `currency: "BRL"` já usa o formato ISO, facilitando a migração.

**Schema:** `currencies (id: text PK, code: text UNIQUE, name: text)`
- `id` = `code` (são iguais, mas `code` facilita queries semânticas)

### D4: Módulo currencies standalone

**Decisão:** Novo módulo `modules/currencies/` com DDD completo, não subpasta de bank-accounts.

**Rationale:** Currencies é domínio transversal — pode ser usado por transactions, balances, reports no futuro. Mesmo padrão do `colors` module (standalone). Inclui: entity, repository port, use-case, service, controller, mapper, Drizzle schema/adapter.

### D5: Remoção do pgEnum `bank_account_type`

**Decisão:** Remover completamente o pgEnum `bank_account_type` e a coluna `type`, substituindo por FK `account_type_id`.

**Rationale:** Os valores já existem na tabela `account_types`. Manter o pgEnum cria redundância — novos tipos precisariam de migration SQL + seed ao invés de apenas seed. A tabela é source of truth.

**Migration sequence:**
1. Adicionar coluna `account_type_id` (nullable inicialmente)
2. Preencher `account_type_id` a partir de `type` (os valores coincidem: `"checking"` → account_types.id `"checking"`)
3. Tornar `account_type_id` NOT NULL
4. Dropar coluna `type`
5. Dropar pgEnum `bank_account_type`

### D6: Response shape enriquecida

**Decisão:** `toResponse()` retorna objetos nested:

```typescript
{
  id: "uuid",
  name: "Nubank",
  color: { id: "purple", name: "Purple", hex: "#7950F2" },
  accountType: { id: "checking", name: "Checking" },
  currency: { id: "BRL", code: "BRL", name: "Real Brasileiro" },
  initialBalance: 1500.00,
  icon: null,
  createdAt: "...",
  updatedAt: "..."
}
```

**Rationale:** Elimina round-trips. Frontend já precisa de name/hex para renderizar — ao invés de cruzar com cache local das lookup tables, o response já vem completo.

**Alternativa descartada:** Retornar apenas IDs e fazer lookup no frontend. Rejeitado: aumenta complexidade do frontend, waterfall requests.

### D7: Repository usa relational queries

**Decisão:** `DrizzleBankAccountRepository` migra de `db.select().from()` para `db.query.bankAccounts.findMany()` com `with: { color: true, accountType: true, currency: true }`.

**Rationale:** Drizzle relational queries fazem JOINs automaticamente e tipam o resultado com as relações. Simplifica o mapper e garante type-safety.

### D8: Migration única com DML inline

**Decisão:** Uma migration SQL com DDL (schema changes) + DML (data conversion) integrados.

**Rationale:** Drizzle-kit gera o DDL, mas a conversão de dados (hex → color_id) precisa de DML manual. A migration é editada após geração para incluir:
- `UPDATE bank_accounts SET color_id = c.id FROM colors c WHERE c.hex = bank_accounts.color`
- `UPDATE bank_accounts SET account_type_id = bank_accounts.type`
- `UPDATE bank_accounts SET currency_id = bank_accounts.currency`

**Fallback para dados órfãos:** Se algum hex não existir em colors, usa `"gray"` como default. Se algum currency não existir, usa `"BRL"`.

### D9: Frontend envia IDs diretamente

**Decisão:** O form de criação de conta passa a enviar `colorId`, `accountTypeId`, `currencyId`.

**Implementação:**
- Color Select: `value={color.id}` (era `value={color.hex}`)
- Type Select: `value={accountType.id}` (já era `value={accountType.id}`)
- Currency: pode ser hidden field com default `"BRL"` ou um Select se multi-currency for desejado

**Rationale:** Simplifica o fluxo — frontend já tem os IDs, era o backend que esperava hex.

## Risks / Trade-offs

**[Dados existentes com hex órfão]** → Migration usa fallback para `"gray"`. Antes de rodar, um `SELECT DISTINCT color FROM bank_accounts` verifica se todos os hexes existem em colors. Se não, adicionar ao seed.

**[pgEnum removal no PostgreSQL]** → `DROP TYPE` falha se o tipo está em uso. A migration remove a coluna `type` ANTES de dropar o enum. Sequência: ADD column → UPDATE data → DROP old column → DROP TYPE.

**[Breaking change na API]** → Aceitável: projeto está em estágio early, sem consumidores externos. Frontend e backend são deployados juntos (monorepo). Não requer API versioning.

**[Relational queries + N+1]** → Drizzle relational queries fazem subqueries ou JOINs, não N+1. Performance é equivalente ou melhor que queries manuais.

**[Balance e Transaction tables]** → Essas tabelas também têm `currency: text` e `color: text`. Esta change NÃO as altera — escopo separado para evitar migration massiva. Serão migradas em changes futuros.

## Migration Plan

### Deploy steps (single migration)

1. Criar tabela `currencies` + seed
2. Adicionar colunas FK nullable em `bank_accounts`
3. Preencher FKs com dados existentes (DML)
4. Tornar FKs NOT NULL + adicionar constraints
5. Dropar colunas antigas (`color`, `type`, `currency`)
6. Dropar pgEnum `bank_account_type`

### Rollback

Se a migration falhar:
- PostgreSQL transactions garantem atomicidade dentro de uma migration
- Para rollback após commit: restaurar backup ou gerar migration reversa (ADD columns back, DROP FKs)

### Drizzle workflow

1. Atualizar schema TypeScript (colunas FK, relations)
2. `bun run --filter @fincheck/api db:generate` → gera migration DDL
3. Editar migration gerada para incluir DML de conversão
4. `bun run --filter @fincheck/api db:migrate` → aplica
5. Verificar: `bun run --filter @fincheck/api db:studio`

## Open Questions

1. **Quantas currencies seedar?** — Proposta: BRL, USD, EUR. Suficiente para MVP. Expandir via seed no futuro.
2. **Currency select no form?** — Form atual não tem select de currency (default "BRL"). Adicionar select ou manter hidden? **Recomendação:** manter como hidden field por ora, adicionar select quando multi-currency for feature real.
