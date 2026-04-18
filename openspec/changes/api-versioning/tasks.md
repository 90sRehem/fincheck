# Tarefas: Versionamento de APIs

## Fase 1 — Backend: Habilitar URI Versioning

- [x] 1.1 Habilitar `enableVersioning()` no bootstrap (`apps/api/src/main.ts`)
  - Files: `apps/api/src/main.ts`
  - O que fazer:
    - Importar `VersioningType` de `@nestjs/common`
    - Adicionar `app.enableVersioning({ type: VersioningType.URI, defaultVersion: "1" })` **após** `setGlobalPrefix("api")` e **antes** da config do Swagger
  - Acceptance: App inicia sem erros; `GET /api/v1/health-check` responde (ou 404 se health-check for neutral)

- [x] 1.2 Marcar `AppController` como `VERSION_NEUTRAL` (`apps/api/src/app.controller.ts`)
  - Files: `apps/api/src/app.controller.ts`
  - O que fazer:
    - Importar `VERSION_NEUTRAL` de `@nestjs/common`
    - Alterar `@Controller()` para `@Controller({ version: VERSION_NEUTRAL })`
  - Acceptance: `GET /api/health-check` retorna 200 "healthy" (sem `/v1/`); `GET /api/v1/health-check` retorna 404

- [x] 1.3 Verificar que rotas better-auth continuam funcionais
  - Files: nenhum arquivo a alterar — apenas validação manual
  - O que fazer:
    - Iniciar o servidor (`bun run --filter @fincheck/api dev`)
    - Testar `POST /api/auth/sign-in/email` com credenciais válidas
    - Testar `POST /api/auth/sign-up/email`
    - Testar `GET /api/auth/get-session`
  - Acceptance: Todas as rotas auth respondem normalmente sem prefixo de versão

- [x] 1.4 Testar que todas as rotas de domínio respondem em `/v1/`
  - Files: nenhum arquivo a alterar — apenas validação manual
  - O que fazer:
    - Testar `GET /api/v1/bank-accounts` (autenticado)
    - Testar `GET /api/v1/transactions` (autenticado)
    - Testar `GET /api/v1/balances` (autenticado)
    - Testar `GET /api/v1/colors` (autenticado)
    - Testar `GET /api/v1/account_types` (autenticado)
  - Acceptance: Todas retornam 200 com dados corretos

## Fase 2 — Swagger/Scalar: Atualizar Documentação

- [x] 2.1 Atualizar configuração do Swagger para refletir versioning (`apps/api/src/main.ts`)
  - Files: `apps/api/src/main.ts`
  - O que fazer:
    - Verificar que `SwaggerModule.createDocument()` já reflete os paths versionados automaticamente
    - Adicionar tags faltantes ao `DocumentBuilder` (Transactions, Balances, Colors) para documentação completa
    - Testar que o Scalar em `GET /docs` mostra paths com `/v1/`
  - Acceptance: Scalar UI em `/docs` exibe todas as rotas com prefixo `/v1/`; rotas auth não aparecem com versão

## Fase 3 — Frontend: Atualizar Consumo da API

- [x] 3.1 Adicionar `VITE_API_BASE_URL` ao schema de env (`apps/web/src/shared/config/env.ts`)
  - Files: `apps/web/src/shared/config/env.ts`, `apps/web/src/vite-env.d.ts`
  - O que fazer:
    - Adicionar `VITE_API_BASE_URL: z.url()` ao `envSchema`
    - Adicionar `readonly VITE_API_BASE_URL: string` ao `ImportMetaEnv`
  - Acceptance: Schema valida ambas variáveis; app não inicia sem elas definidas

- [x] 3.2 Atualizar `.env` do frontend com URLs versionadas (`apps/web/.env`)
  - Files: `apps/web/.env`
  - O que fazer:
    - Alterar para:
      ```
      VITE_API_BASE_URL=http://localhost:3333
      VITE_API_URL=http://localhost:3333/api/v1
      ```
  - Acceptance: Variáveis disponíveis via `env.VITE_API_URL` e `env.VITE_API_BASE_URL`

- [x] 3.3 Criar `authClient` separado para rotas de autenticação (`apps/web/src/shared/api/auth-client.ts`)
   - Files: `apps/web/src/shared/api/auth-client.ts`, `apps/web/src/shared/api/index.ts` (barrel)
   - O que fazer:
     - Criar `authClient` usando `createApiClient({ baseURL: env.VITE_API_BASE_URL, ... })`
     - Reutilizar os mesmos interceptors do `apiClient` existente
     - Exportar via barrel
   - Acceptance: `authClient` instanciado com baseURL sem versão; importável via `@/shared/api`
   - **Fixes aplicadas:**
     - Removido Bearer token do authClient (backend usa cookies)
     - Criado `interceptors.ts` com lógica reutilizável
     - Logs sensíveis removidos (body/response data)

- [x] 3.4 Migrar chamadas de auth para usar `authClient` (`apps/web/src/shared/api/endpoints/`, `apps/web/src/entities/users/api/`)
   - Files:
     - `apps/web/src/shared/api/endpoints/login.ts`
     - `apps/web/src/shared/api/endpoints/register.ts`
     - `apps/web/src/entities/users/api/get-user.ts`
   - O que fazer:
     - Trocar `apiClient` por `authClient` nas chamadas de auth
     - Manter os paths como estão (`/api/auth/sign-in/email`, etc.) pois o baseURL do authClient é apenas o host
   - Acceptance: Login, registro e get-session continuam funcionando via `authClient`
   - **Fixes aplicadas:**
     - Normalizado import em register.ts (barrel em vez de relative)

- [x] 3.5 Normalizar paths de API para remover prefixo `/api` manual (`apps/web/src/pages/home/api/`, `apps/web/src/entities/balance/api/`)
  - Files:
    - `apps/web/src/pages/home/api/transactions.ts` — `"/api/transactions"` → `"/transactions"`
    - `apps/web/src/pages/home/api/accounts.ts` — `"api/bank-accounts"` → `"/bank-accounts"`
    - `apps/web/src/pages/home/api/colors.ts` — `"api/colors"` → `"/colors"`
    - `apps/web/src/pages/home/api/account-types.ts` — `"api/account_types"` → `"/account_types"`
    - `apps/web/src/entities/balance/api/get-balance.ts` — `"api/balances"` → `"/balances"`
    - `apps/web/src/pages/home/api/categories.ts` — `"/categories"` → `"/categories"` (já sem prefixo)
  - O que fazer:
    - Remover `api/` ou `/api/` do início de cada URL
    - Garantir que todos os paths começam com `/` (normalizar)
  - Acceptance: Todas as chamadas de API de domínio funcionam via `VITE_API_URL` (que já inclui `/api/v1`)

- [x] 3.6 Testar fluxo completo end-to-end
  - Files: nenhum arquivo a alterar — apenas validação manual
  - O que fazer:
    - Iniciar backend (`bun run --filter @fincheck/api dev`)
    - Iniciar frontend (`bun run --filter @fincheck/web dev`)
    - Testar: login → dashboard → listar contas → criar transação → ver saldos
    - Verificar no console do browser que as URLs contêm `/api/v1/`
    - Verificar que login/registro usam `/api/auth/` (sem versão)
  - Acceptance: Todos os fluxos funcionam; nenhum 404; console sem erros de rede

## Fase 4 — Documentação e Convenções

- [x] 4.1 Documentar convenção de versionamento no `AGENTS.md` do backend (`apps/api/AGENTS.md`)
  - Files: `apps/api/AGENTS.md`
  - O que fazer:
    - Adicionar seção "API Versioning" com:
      - Estratégia: URI versioning (`/api/v1/...`)
      - Como criar rotas v2: `@Controller({ path: "resource", version: "2" })`
      - Convenção de pasta: `presentation/v2/` para controllers de nova versão
      - Health-check e auth são `VERSION_NEUTRAL`
      - Política de deprecação: headers `Deprecation`, `Sunset`, `Link`
  - Acceptance: Documentação clara e acionável para novos módulos

- [x] 4.2 Atualizar `AGENTS.md` do frontend com convenção de consumo versionado (`apps/web/AGENTS.md`)
  - Files: `apps/web/AGENTS.md`
  - O que fazer:
    - Documentar que `VITE_API_URL` já inclui `/api/v1`
    - Documentar que paths de chamadas de domínio são relativos (sem `/api`)
    - Documentar que `authClient` é usado para rotas auth (sem versão)
  - Acceptance: Novos módulos do frontend seguem a convenção sem ambiguidade

- [x] 4.3 Atualizar `AGENTS.md` raiz com referência ao versionamento (`AGENTS.md`)
  - Files: `AGENTS.md`
  - O que fazer:
    - Adicionar na seção "Commands" ou criar seção "API Versioning" com overview
  - Acceptance: Informação acessível a qualquer agente que consulte o AGENTS.md raiz
