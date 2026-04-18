## Why

A tabela `bank_accounts` armazena `color` como hex string, `type` via pgEnum e `currency` como texto livre. As lookup tables `colors` e `account_types` já existem no banco com seus próprios módulos DDD, mas `bank_accounts` não referencia essas tabelas — armazena valores duplicados. Isso causa:

1. **Inconsistência de dados** — nada impede criar uma conta com `color: "#999999"` (cor que não existe no catálogo) ou `currency: "XYZ"` (moeda inexistente).
2. **Dificuldade de evolução** — se o nome ou hex de uma cor mudar, todas as bank_accounts com aquele hex ficam desatualizadas.
3. **Queries ineficientes** — para listar contas com dados de cor completos (id, name, hex), o backend precisaria fazer lookup manual ao invés de usar relational queries do Drizzle.
4. **Falta de tabela `currencies`** — não existe tabela de moedas; `currency` é string livre com default "BRL".

Resolver agora evita acumular dados órfãos enquanto a base de usuários é pequena, e prepara a API para retornar objetos ricos nas relações.

## What Changes

- **BREAKING** — Schema `bank_accounts`: campos `color` (hex text), `type` (pgEnum) e `currency` (text) substituídos por `color_id` (FK → colors), `account_type_id` (FK → account_types) e `currency_id` (FK → currencies)
- **Nova tabela `currencies`** — lookup table com `id`, `code` (ISO 4217) e `name`, seedada com BRL (e opcionalmente USD, EUR)
- **Nova relação no schema Drizzle** — `bankAccountsRelations` expandida com `color`, `accountType` e `currency`
- **Remoção do pgEnum `bank_account_type`** — substituído pela FK para `account_types`; valores vêm da tabela
- **Migration de dados** — converter hex → color_id, type enum → account_type_id, currency text → currency_id para registros existentes
- **Atualização da entity `BankAccount`** — props mudam de `color: string`, `type: BankAccountType`, `currency: string` para `colorId: string`, `accountTypeId: string`, `currencyId: string`
- **Atualização do mapper** — `toResponse()` passa a incluir objetos completos (color, accountType, currency) ou IDs com dados hidratados
- **Atualização de DTOs** — create/update passam a aceitar `colorId`, `accountTypeId`, `currencyId` ao invés de hex/enum/string
- **Atualização do validator** — remove validação hex e enum, valida UUIDs/text IDs dos lookups
- **Frontend** — tipos, schemas Zod, payloads de API e forms adaptados para enviar IDs ao invés de valores raw

## Capabilities

### New Capabilities
- `currencies-lookup`: Tabela de moedas (currencies), módulo DDD completo (entity, repository, use-case, controller GET /currencies), seed com BRL/USD/EUR
- `bank-account-fk-relations`: Relações FK de bank_accounts → colors, account_types, currencies com Drizzle relations e response enriquecido

### Modified Capabilities
- (nenhuma spec existente requer mudança de requisitos — as specs serão novas)

## Impact

### Apps afetados
- **`apps/api`** — schema, migration, entity, validator, DTOs, mapper, repository, controllers, seed, module registration
- **`apps/web`** — tipos Account, schemas Zod (add/update), payloads de API, formulário add-accounts, hooks

### API contract (BREAKING)
- **Request**: `{ color: "#hex", type: "checking", currency: "BRL" }` → `{ colorId: "indigo", accountTypeId: "checking", currencyId: "BRL" }`
- **Response**: `{ color: "#hex", type: "checking", currency: "BRL" }` → `{ color: { id, name, hex }, accountType: { id, name }, currency: { id, code, name } }`

### Database
- Nova tabela: `currencies`
- Alteração: `bank_accounts` (3 colunas removidas, 3 FKs adicionadas)
- Migration: DDL + DML (conversão de dados existentes)
- Remoção: pgEnum `bank_account_type` (após migração dos dados)

### Riscos
- **Dados existentes** — migration precisa converter hex → color_id corretamente; hexes que não existem no catálogo de cores precisam de fallback
- **pgEnum removal** — PostgreSQL não suporta DROP TYPE facilmente se existem dependências; migration precisa dropar coluna antes do tipo
- **Frontend downtime** — se API e frontend não forem deployados juntos, o contrato quebra; requer deploy coordenado

## Success Criteria

1. `bank_accounts` referencia `colors`, `account_types` e `currencies` via FK
2. `GET /bank-accounts` retorna objetos completos nas relações
3. `POST/PUT /bank-accounts` aceita `colorId`, `accountTypeId`, `currencyId`
4. `GET /currencies` endpoint funcional com seed data
5. Migration converte dados existentes sem perda
6. Frontend cria e lista contas corretamente com o novo contrato
7. `turbo check-types` passa em todos os packages

## Technical Constraints

- PostgreSQL 15 + Drizzle ORM (migrações via drizzle-kit)
- IDs determinísticos (text PK, não UUID) para lookup tables — padrão estabelecido em colors e account_types
- Seed separado de migrations (padrão existente em `seed.ts`)
- Sem TypeScript enums — usar `as const` objects (pgEnum no Drizzle é permitido apenas se necessário, mas estamos removendo o existente)
