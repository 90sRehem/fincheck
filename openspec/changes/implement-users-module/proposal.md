## Why

O frontend foi construído com uma camada de `userStore` + `UserService` + `UserStorage` para persistir dados do usuário, e um endpoint `GET /api/users/:id` que nunca foi implementado. Na prática, o better-auth já expõe `GET /api/auth/get-session` com o user completo, e o `sessionStore` (token no localStorage) já é suficiente para saber se o usuário está autenticado. Toda a infra de user storage é redundante e o fluxo de login está quebrado (salva `email: ""`).

## What Changes

- **Corrigir `login.ts`**: better-auth retorna `token` (não `accessToken`) — corrigir tipo e retornar `user` completo
- **Simplificar `use-login.ts`**: remover `userActions.addUser` — só salva o token via `sessionActions.login()`
- **Simplificar `use-register.ts`**: remover `userActions.addUser` pelo mesmo motivo
- **Reescrever `get-user.ts`**: trocar `GET /api/users/:id` por `GET /api/auth/get-session`, remover parâmetro `id`
- **Atualizar `user-query.ts`**: remover dependência de `id`, query key vira `["user", "me"]`
- **Simplificar `use-user.ts`**: remover leitura do `userStore` para obter `id`
- **Atualizar `session-store.ts`**: `logout()` invalida query `["user", "me"]` (fire-and-forget) e redireciona para `/session`
- **Deletar** toda a infra de user storage: `entities/users/model/user.ts`, `pages/session/model/user.ts`, `shared/lib/user/`, `shared/lib/storage/user-storage.ts`
- **Limpar** referências órfãs em barrels e imports

## Capabilities

### New Capabilities

- `get-user-profile`: `GET /api/auth/get-session` como fonte de dados do usuário autenticado — sem endpoint customizado no backend

### Modified Capabilities

*(nenhuma spec existente é alterada)*

## Impact

**apps/web apenas** — zero mudanças no backend.

Arquivos deletados:
- `src/entities/users/model/user.ts`
- `src/pages/session/model/user.ts`
- `src/shared/lib/user/user-service.ts`
- `src/shared/lib/user/index.ts`
- `src/shared/lib/storage/user-storage.ts`

Arquivos modificados:
- `src/shared/api/endpoints/login.ts`
- `src/pages/session/model/use-login.ts`
- `src/pages/session/model/use-register.ts`
- `src/entities/users/api/get-user.ts`
- `src/entities/users/api/user-query.ts`
- `src/entities/users/model/use-user.ts`
- `src/entities/session/model/session-store.ts`
- `src/shared/lib/storage/index.ts` (remover export de user-storage)
- `src/shared/lib/index.ts` (remover export de user)

## Success Criteria

- `UserAvatar` renderiza o nome do usuário após login sem erros
- `GET /api/auth/get-session` é chamado uma vez ao montar o avatar
- Logout invalida a query `["user", "me"]` e redireciona para `/session`
- Nenhuma referência a `userStore`, `userActions`, `userService`, `UserStorage` permanece no código
- `turbo check-types` passa sem erros
- Biome lint passa sem erros

## Technical Constraints

- **Sem better-auth client SDK no web** — usar `apiClient` (FetchHttpClient) para chamar `/api/auth/get-session`
- **Cookie-based session**: better-auth usa cookie de sessão — o `apiClient` precisa enviar `credentials: "include"` na chamada de get-session (ou o cookie já é enviado automaticamente pelo browser)
- **`sessionStore` permanece**: é a fonte de verdade para "está logado?" — guard de rota continua usando `tokenService.hasToken()`
