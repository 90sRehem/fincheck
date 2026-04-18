# Proposta: Versionamento de APIs do Backend

## Contexto

O backend Fincheck (`apps/api`) expõe rotas sob o prefixo global `/api` sem qualquer mecanismo de versionamento. Todas as rotas — `bank-accounts`, `transactions`, `balances`, `colors`, `account_types` — são acessíveis diretamente (ex: `GET /api/transactions`). O frontend (`apps/web`) consome essas rotas via `FetchHttpClient` com `baseURL = VITE_API_URL` (atualmente `http://localhost:3333`), usando paths hardcoded como `"/api/transactions"`, `"api/bank-accounts"`, etc.

### Estado Atual das Rotas

| Módulo | Rota | Métodos |
|--------|------|---------|
| Health | `GET /api/health-check` | GET |
| Bank Accounts | `/api/bank-accounts` | POST, GET, PUT, DELETE |
| Account Types | `/api/account_types` | GET |
| Transactions | `/api/transactions` | POST, GET, GET/:id, PUT/:id, DELETE/:id |
| Balances | `/api/balances` | GET |
| Colors | `/api/colors` | GET |
| Auth (better-auth) | `/api/auth/*` | Gerenciado pelo better-auth |

### Problema

Sem versionamento, qualquer breaking change em contratos de API (renomear campos, mudar formatos, remover endpoints) quebra o frontend e potenciais clientes futuros. À medida que o Fincheck evolui — especialmente com módulos como categories, budgets, goals previstos — é essencial ter um mecanismo que permita evoluir a API sem quebrar consumidores existentes.

## Motivação

1. **Evolução segura** — Permitir breaking changes em versões novas sem afetar consumidores da versão atual
2. **Padrão de mercado** — URI versioning (`/v1/`, `/v2/`) é o padrão REST mais adotado e mais explícito
3. **Documentação clara** — Swagger/Scalar pode documentar cada versão separadamente
4. **Preparação para mobile** — Clientes mobile não atualizam instantaneamente; versionamento é obrigatório
5. **NestJS nativo** — O framework já oferece `enableVersioning()` com suporte a URI, sem libs externas

## Decisões

### 1. Estratégia: URI Path Versioning

**Escolha:** URI versioning (`/api/v1/...`)  
**Alternativas descartadas:**
- Header versioning (`Accept-Version`) — menos visível, mais difícil de debugar, não aparece em logs/URLs
- Query param (`?version=1`) — não-RESTful, polui query string
- Media type (`Accept: application/vnd.fincheck.v1+json`) — complexo demais para o estágio do projeto

**Justificativa:** URI versioning é o mais explícito, visível em logs/URLs, suportado nativamente pelo NestJS, e o mais simples de consumir no frontend.

### 2. Backward Compatibility via `defaultVersion`

Todas as rotas existentes serão marcadas como `VERSION_NEUTRAL` **ou** receberão `version: '1'` via `defaultVersion: '1'` no `enableVersioning()`. Isso garante que:
- Rotas existentes continuam respondendo em `/api/v1/...`
- Nenhuma rota quebra durante a migração
- Controllers existentes **não precisam de alteração** na fase 1

### 3. Rotas Auth (better-auth) como VERSION_NEUTRAL

As rotas de autenticação (`/api/auth/*`) são gerenciadas pelo `@thallesp/nestjs-better-auth` e não passam pelo sistema de controllers NestJS convencional. Elas devem permanecer **version-neutral** — acessíveis independente de versão.

### 4. Health Check como VERSION_NEUTRAL

O endpoint `GET /api/health-check` não pertence a nenhuma versão específica da API de negócio. Deve ser version-neutral.

### 5. Swagger Multi-Version

O Swagger/Scalar será configurado para exibir documentação de cada versão, permitindo navegação entre versões na UI do Scalar.

### 6. Frontend: variável de ambiente para versão base

O frontend adicionará um prefixo de versão nas chamadas, centralizando a versão no `apiClient`. Mudança mínima: o `VITE_API_URL` permanece como está; o path `/api/v1/` é montado pelo `createApiClient`.

## Escopo

### Incluído
- Habilitar `enableVersioning()` no bootstrap (`main.ts`)
- Configurar `defaultVersion: '1'` para que rotas existentes respondam em `/v1/`
- Marcar `AppController` (health-check) como `VERSION_NEUTRAL`
- Garantir que rotas better-auth permaneçam acessíveis
- Configurar Swagger para exibir versão
- Atualizar paths do frontend para usar `/api/v1/`
- Documentar convenção de deprecação

### Excluído
- Criar rotas v2 (será feito quando houver necessidade real de breaking change)
- Migrar better-auth para versioned routes
- Rate limiting por versão
- API gateway ou infra de roteamento externo

## Riscos

| Risco | Mitigação |
|-------|-----------|
| Rotas better-auth quebram com prefix versioning | Testar que `/api/auth/*` continua funcional; ajustar basePath se necessário |
| Scalar não suporta multi-version nativamente | Usar `swaggerOptions.urls` dropdown ou paths separados `/docs/v1` |
| Frontend tem paths hardcoded inconsistentes (com e sem `/` inicial) | Normalizar todos os paths no mesmo formato durante a atualização |
| `defaultVersion` pode afetar módulos inesperados | Testar cada rota após habilitar; usar version-neutral onde necessário |
