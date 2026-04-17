## 1. Corrigir FetchHttpClient

- [x] 1.1 Adicionar `credentials: "include"` no `fetch` em `apps/web/src/shared/lib/core/http/fetch-http-client.ts` (linha 121)

## 2. Corrigir fluxo de login

- [x] 2.1 Corrigir `apps/web/src/shared/api/endpoints/login.ts`: renomear `accessToken` para `token` no tipo `LoginResponse` e retornar `{ token, user }` completo
- [x] 2.2 Simplificar `apps/web/src/pages/session/model/use-login.ts`: remover `userActions.addUser`, manter apenas `sessionActions.login({ token })`
- [x] 2.3 Simplificar `apps/web/src/pages/session/model/use-register.ts`: remover `userActions.addUser` e o import de `userActions`

## 3. Substituir get-user por get-session

- [x] 3.1 Reescrever `apps/web/src/entities/users/api/get-user.ts`: trocar URL para `/api/auth/get-session`, remover parâmetro `id`, ajustar tipo de resposta para `{ session: {...}, user: { id, name, email, image, emailVerified } }`
- [x] 3.2 Atualizar `apps/web/src/entities/users/api/user-query.ts`: remover parâmetro `id` de `getMe`, query key vira `["user", "me"]`
- [x] 3.3 Simplificar `apps/web/src/entities/users/model/use-user.ts`: remover leitura do `userStore`, chamar `userQueryFactory.getMe()` sem argumentos

## 4. Atualizar logout

- [x] 4.1 Atualizar `apps/web/src/entities/session/model/session-store.ts`: em `logout()`, adicionar `queryClient.invalidateQueries({ queryKey: ["user", "me"] })` (fire-and-forget, sem await) e `globalThis.location.href = "/session"` após `tokenService.removeToken()`
- [x] 4.2 Remover chamada a `userService.removeUser()` do `logout()` em `session-store.ts`

## 5. Deletar infra de user storage

- [x] 5.1 Deletar `apps/web/src/entities/users/model/user.ts`
- [x] 5.2 Deletar `apps/web/src/pages/session/model/user.ts`
- [x] 5.3 Deletar `apps/web/src/shared/lib/user/user-service.ts`
- [x] 5.4 Deletar `apps/web/src/shared/lib/user/index.ts`
- [x] 5.5 Deletar `apps/web/src/shared/lib/storage/user-storage.ts`

## 6. Limpar barrels e imports órfãos

- [x] 6.1 Remover export de `user-storage` em `apps/web/src/shared/lib/storage/index.ts`
- [x] 6.2 Remover export de `user` (UserService) em `apps/web/src/shared/lib/index.ts`
- [x] 6.3 Remover exports de `userStore`, `userActions` do barrel `apps/web/src/entities/users/index.ts`
- [x] 6.4 Remover export de `userQueryFactory` do barrel `apps/web/src/entities/users/index.ts` se não for mais usado externamente (verificar usages)
- [x] 6.5 Verificar e corrigir qualquer import quebrado em `apps/web/src/shared/config/constants.ts` (USER_STORAGE_KEY pode ser removido se não usado em outro lugar)

## 7. Verificação final

- [x] 7.1 Executar `turbo check-types` e corrigir todos os erros de tipo
- [x] 7.2 Executar `bun run lint` e corrigir todos os erros do Biome
