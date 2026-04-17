## ADDED Requirements

### Requirement: Logout invalida query de perfil e redireciona
Ao fazer logout, o sistema SHALL invalidar a query `["user", "me"]` de forma fire-and-forget (sem await) e SHALL redirecionar o usuário para `/session`.

#### Scenario: Logout limpa cache e redireciona
- **WHEN** `sessionActions.logout()` é chamado
- **THEN** `queryClient.invalidateQueries({ queryKey: ["user", "me"] })` é disparado sem await
- **THEN** `tokenService.removeToken()` é chamado
- **THEN** o usuário é redirecionado para `/session`

#### Scenario: Token expirado dispara logout automático
- **WHEN** o interceptor do `apiClient` recebe HTTP 401
- **THEN** `tokenService.notifyTokenExpired()` é chamado
- **THEN** `sessionActions.logout()` é executado via callback configurado
- **THEN** o usuário é redirecionado para `/session`
