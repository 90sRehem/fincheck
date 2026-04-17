## ADDED Requirements

### Requirement: Usuário autenticado obtém perfil via get-session
O sistema SHALL buscar o perfil do usuário autenticado chamando `GET /api/auth/get-session`. A chamada SHALL incluir `credentials: "include"` para enviar o cookie de sessão do better-auth. O resultado SHALL expor `{ id, name, email, image, emailVerified }`.

#### Scenario: Sessão válida retorna perfil
- **WHEN** `GET /api/auth/get-session` é chamado com cookie de sessão válido
- **THEN** a resposta contém `{ session, user: { id, name, email, image, emailVerified } }`
- **THEN** `useUser()` retorna o objeto `user` sem erros

#### Scenario: Sem sessão retorna 401
- **WHEN** `GET /api/auth/get-session` é chamado sem cookie de sessão
- **THEN** a resposta é HTTP 401
- **THEN** o interceptor do `apiClient` dispara `tokenService.notifyTokenExpired()`
- **THEN** `sessionActions.logout()` é chamado e o usuário é redirecionado para `/session`

### Requirement: FetchHttpClient envia credentials nas chamadas de sessão
O `FetchHttpClient` SHALL suportar a opção `credentials: "include"` no `fetch` para que cookies de sessão sejam enviados ao backend.

#### Scenario: Cookie enviado na requisição
- **WHEN** `apiClient.get({ url: "/api/auth/get-session" })` é chamado
- **THEN** o `fetch` subjacente inclui `credentials: "include"` na requisição
- **THEN** o cookie de sessão do better-auth é enviado ao servidor

### Requirement: Query key estável sem dependência de userId
A query de perfil SHALL usar a chave `["user", "me"]` sem depender de um `id` externo. O `useUser()` SHALL funcionar sem ler nenhum store para obter o id do usuário.

#### Scenario: Query monta sem userId no store
- **WHEN** `useUser()` é chamado após login
- **THEN** a query é disparada com key `["user", "me"]`
- **THEN** nenhum `userStore` ou `userService` é consultado
