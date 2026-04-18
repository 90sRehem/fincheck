# Design Técnico: Versionamento de APIs

## Arquitetura

### NestJS URI Versioning

O NestJS oferece `enableVersioning()` nativo com tipo `VersioningType.URI`. Quando habilitado, o framework:

1. Adiciona um **prefixo de versão** (`/v1/`, `/v2/`) entre o global prefix e o path do controller
2. Roteia requests baseado na versão no URL
3. Permite granularidade por controller (`@Controller({ version: '1' })`) ou por route (`@Version('1')`)
4. Suporta `VERSION_NEUTRAL` para rotas que ignoram versão
5. Suporta `defaultVersion` para atribuir versão padrão a rotas sem anotação explícita

### Estrutura de URLs Resultante

```
Antes:  GET /api/bank-accounts
Depois: GET /api/v1/bank-accounts

Antes:  POST /api/transactions
Depois: POST /api/v1/transactions

Neutras (sem mudança):
        GET /api/health-check
        POST /api/auth/sign-in/email
        GET /api/auth/get-session
```

## Configuração do Bootstrap (`main.ts`)

### Habilitar Versioning

```typescript
import { VersioningType } from "@nestjs/common";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors({ origin: process.env.WEB_CLIENT_URL, credentials: true });
  app.set("x-powered-by", false);
  app.setGlobalPrefix("api");

  // Habilitar URI versioning
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: "1",
  });

  // ... Swagger config (atualizada)
}
```

**Detalhe crítico:** `enableVersioning()` deve ser chamado **após** `setGlobalPrefix()` e **antes** da configuração do Swagger. O `defaultVersion: '1'` faz com que **todos** os controllers sem `version` explícito respondam automaticamente em `/v1/`.

### Ordem de chamadas no bootstrap

```
1. NestFactory.create()
2. app.enableCors()
3. app.set("x-powered-by", false)
4. app.setGlobalPrefix("api")
5. app.enableVersioning({ type: URI, defaultVersion: "1" })
6. Swagger/Scalar config
7. app.listen()
```

## Controllers: Estratégia de Migração

### Fase 1 — Todos os controllers existentes em v1 (zero alteração nos controllers)

Com `defaultVersion: '1'`, nenhum controller precisa ser modificado. Todos passam a responder em `/api/v1/...` automaticamente.

```typescript
// SEM ALTERAÇÃO — continua funcionando
@Controller("bank-accounts")  // responde em /api/v1/bank-accounts
export class CreateBankAccountController { ... }
```

### Exceções — Controllers VERSION_NEUTRAL

O `AppController` (health-check) deve ser explicitamente marcado como `VERSION_NEUTRAL`:

```typescript
import { Controller, Get, VERSION_NEUTRAL } from "@nestjs/common";

@Controller({ version: VERSION_NEUTRAL })
export class AppController {
  @Get("health-check")
  healthCheck(): string {
    return this.appService.healthCheck();
  }
}
```

### Fase 2 — Quando precisar de v2 (futuro)

Quando um breaking change for necessário, criar um novo controller com `version: '2'`:

```typescript
// modules/transactions/presentation/v2/transactions.controller.ts
@Controller({ path: "transactions", version: "2" })
export class TransactionsControllerV2 {
  @Get()
  list() {
    // Nova implementação com contrato diferente
  }
}
```

O controller v1 original continua funcionando. Ambos são registrados no módulo:

```typescript
@Module({
  controllers: [TransactionsController, TransactionsControllerV2],
  // ...
})
```

### Convenção de estrutura de pastas para v2+

```
modules/{feature}/
├── presentation/
│   ├── {use-case}.controller.ts          # v1 (default)
│   └── v2/
│       └── {use-case}.controller.ts      # v2
```

## Rotas better-auth

### Problema

O `@thallesp/nestjs-better-auth` registra rotas internamente (ex: `/api/auth/sign-in/email`). Essas rotas **não** são controllers NestJS convencionais — elas são middleware/express routes registrados diretamente.

### Solução

As rotas better-auth **não são afetadas** pelo `enableVersioning()` porque:
1. `enableVersioning()` só afeta routes registrados via `@Controller`
2. O better-auth usa middleware Express direto, que fica fora do sistema de versioning do NestJS
3. As rotas auth continuam em `/api/auth/*` sem prefixo de versão

**Verificação necessária:** Confirmar em testes que `POST /api/auth/sign-in/email` continua respondendo após habilitar versioning.

## Swagger / Scalar

### Configuração atualizada

```typescript
const config = new DocumentBuilder()
  .setTitle("Fincheck API")
  .setDescription(
    "API de gerenciamento de finanças pessoais. Todos os endpoints requerem autenticação via sessão (cookie `better-auth.session_token`).",
  )
  .setVersion("1.0")
  .addCookieAuth("better-auth.session_token")
  .addTag("Health", "Status da API")
  .addTag("Bank Accounts", "Gerenciamento de contas bancárias")
  .addTag("Transactions", "Gerenciamento de transações")
  .addTag("Balances", "Saldos do usuário")
  .addTag("Colors", "Cores disponíveis")
  .build();

const document = SwaggerModule.createDocument(app, config);
app.use("/docs", apiReference({ content: document }));
```

O Swagger automaticamente reflete os paths com `/v1/` quando versioning está habilitado, pois `SwaggerModule.createDocument()` lê os metadados de versão dos controllers.

### Futuramente — Multi-version docs

Quando v2 existir, configurar Swagger com dropdown:

```typescript
SwaggerModule.setup("docs/v1", app, v1Document, {
  jsonDocumentUrl: "/docs/v1/swagger.json",
});
SwaggerModule.setup("docs/v2", app, v2Document, {
  jsonDocumentUrl: "/docs/v2/swagger.json",
});
```

Isso é **fora do escopo** da fase 1, mas a arquitetura suporta.

## Frontend (`apps/web`)

### Mudança necessária

O frontend precisa atualizar os paths das chamadas HTTP para incluir `/v1/`. A abordagem mais limpa é centralizar o prefixo de versão no `createApiClient`.

### Opção A — Prefixo no baseURL (RECOMENDADA)

Nenhuma mudança nos arquivos de API individuais. Apenas o `.env`:

```
# .env
VITE_API_URL=http://localhost:3333/api/v1
```

E ajustar os paths das chamadas para remover o prefixo `/api` que agora está no baseURL:

```typescript
// Antes: url: "/api/transactions"
// Depois: url: "/transactions"  (baseURL já inclui /api/v1)
```

**Vantagem:** Centraliza a versão em um único lugar. Para migrar para v2, basta mudar o `.env`.  
**Desvantagem:** Requer ajustar todos os paths existentes para remover o prefixo `/api`.

### Opção B — Manter baseURL, adicionar helper

```typescript
// shared/api/versioned-url.ts
const API_VERSION = "v1";
export const versionedUrl = (path: string) => `/api/${API_VERSION}/${path}`;
```

**Descartada:** Mais intrusiva, requer mudar cada chamada individualmente.

### Decisão: Opção A

Atualizar `VITE_API_URL` para incluir `/api/v1` e normalizar todos os paths removendo o prefixo `/api` manual.

### Rotas auth — tratamento especial

As rotas de auth (`/api/auth/*`) **não** têm prefixo de versão. O frontend já usa paths absolutos para auth:
- `"/api/auth/sign-up/email"`
- `"/api/auth/get-session"`
- `"api/auth/sign-in/email"`

Essas chamadas devem continuar usando o path absoluto sem versão, **não** passando pelo apiClient versionado. 

A solução é criar um `authClient` separado com `baseURL` sem versão:

```typescript
// shared/api/auth-client.ts
export const authClient = createApiClient({
  baseURL: env.VITE_API_BASE_URL,  // http://localhost:3333
  // ... mesmos headers e interceptors
});
```

E adicionar `VITE_API_BASE_URL` ao `.env`:

```
VITE_API_BASE_URL=http://localhost:3333
VITE_API_URL=http://localhost:3333/api/v1
```

## Convenção de Deprecação

### Headers de Deprecação

Quando uma versão for marcada para remoção, os controllers devem retornar headers:

```typescript
@Header("Deprecation", "true")
@Header("Sunset", "2027-01-01T00:00:00Z")
@Header("Link", '</api/v2/transactions>; rel="successor-version"')
```

### Swagger Deprecation

Usar `@ApiOperation({ deprecated: true })` para marcar endpoints individuais.

### Lifecycle policy

- **Versão ativa**: Recebe features e bug fixes
- **Versão deprecated**: Só bug fixes críticos, headers de deprecação
- **Versão sunset**: Removida após data anunciada (mínimo 3 meses de aviso)

## Testes

### O que verificar após habilitar versioning

1. `GET /api/v1/health-check` → deve retornar 404 (health-check é version-neutral)
2. `GET /api/health-check` → deve retornar 200 "healthy"
3. `GET /api/v1/bank-accounts` → deve retornar 200 (autenticado)
4. `GET /api/v1/transactions` → deve retornar 200 (autenticado)
5. `GET /api/v1/balances` → deve retornar 200 (autenticado)
6. `GET /api/v1/colors` → deve retornar 200 (autenticado)
7. `GET /api/v1/account_types` → deve retornar 200 (autenticado)
8. `POST /api/auth/sign-in/email` → deve retornar 200 (sem versão)
9. `GET /api/bank-accounts` (sem versão) → comportamento depende da config; com `defaultVersion`, deve retornar 404 (requer `/v1/`)
