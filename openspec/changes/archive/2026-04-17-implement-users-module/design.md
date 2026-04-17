## Context

O frontend foi construído assumindo um endpoint customizado `GET /api/users/:id` que nunca existiu. O better-auth já expõe `GET /api/auth/get-session` com o user completo. Paralelamente, existe uma camada de `userStore` + `UserService` + `UserStorage` que persiste dados do usuário no localStorage — redundante, pois o `sessionStore` (token) já é suficiente para saber se o usuário está autenticado.

Estado atual problemático:
- `login.ts` espera `accessToken` mas better-auth retorna `token`
- `use-login.ts` salva `{ id, email: "" }` no store — dados incompletos
- `get-user.ts` chama `/api/users/:id` — 404 garantido
- `useUser()` depende do `userStore` para obter o `id` antes de disparar a query
- Dois stores de user duplicados (`entities/users/model/user.ts` e `pages/session/model/user.ts`)

## Goals / Non-Goals

**Goals:**
- Corrigir o fluxo de login para usar o shape correto do better-auth
- Substituir `GET /api/users/:id` por `GET /api/auth/get-session`
- Eliminar toda a infra de user storage (store, service, storage class)
- Logout com invalidação de cache + redirecionamento
- Adicionar `credentials: "include"` no `FetchHttpClient` para cookies de sessão

**Non-Goals:**
- Nenhuma mudança no backend
- Não implementar o módulo NestJS de usuários
- Não adicionar better-auth client SDK no web
- Não implementar edição de perfil

## Decisions

### D1 — `GET /api/auth/get-session` como fonte de dados do usuário

**Decisão:** Usar o endpoint nativo do better-auth em vez de criar um endpoint customizado.

**Alternativas consideradas:**
- Criar `GET /api/users/me` no NestJS → mais trabalho, zero benefício adicional
- Salvar user completo no store no login e não fazer HTTP → dados ficam stale, sem refresh

**Rationale:** O better-auth já gerencia a sessão e retorna o user atualizado. Zero backend novo, sempre fresco.

### D2 — Remover userStore e toda a infra de user storage

**Decisão:** Deletar `userStore`, `UserService`, `UserStorage`, `user-storage.ts`.

**Alternativas consideradas:**
- Manter o store como cache local → duplicação de estado com React Query, fonte de bugs

**Rationale:** React Query já é o cache. Dois sistemas de cache para o mesmo dado é complexidade sem benefício. O `sessionStore` (token) continua sendo a fonte de verdade para "está logado?".

### D3 — `credentials: "include"` no FetchHttpClient

**Decisão:** Adicionar `credentials: "include"` no `fetch` dentro do `FetchHttpClient`.

**Alternativas consideradas:**
- Criar um segundo `apiClient` só para chamadas de sessão → over-engineering
- Passar `credentials` como opção por request → possível, mas desnecessário agora

**Rationale:** O backend roda na mesma origem (ou origem confiável via CORS). Enviar cookies em todas as requisições é o comportamento correto para uma SPA com cookie-based auth.

### D4 — Logout: fire-and-forget + redirect

**Decisão:** `sessionActions.logout()` chama `queryClient.invalidateQueries(["user", "me"])` sem await e depois redireciona via `globalThis.location.href`.

**Rationale:** Não precisamos esperar a invalidação completar para redirecionar. O redirect já desmonta os componentes que usam a query. Fire-and-forget garante que o cache seja limpo sem bloquear o UX.

## Risks / Trade-offs

- **[Risk] `credentials: "include"` em todas as requests** → O backend já configura `trustedOrigins` no better-auth, então CORS está correto. Risco baixo.
- **[Risk] Remover userStorage quebra imports** → Barrels (`shared/lib/index.ts`, `shared/lib/storage/index.ts`) precisam ser atualizados. Coberto nas tasks.
- **[Trade-off] Sem cache local do user** → Cada mount do `UserAvatar` dispara `GET /api/auth/get-session`. Aceitável: React Query deduplica requests em voo e o `staleTime` padrão evita refetch desnecessário.

## Migration Plan

1. Corrigir `login.ts` (fix de tipo — não quebra nada)
2. Simplificar `use-login.ts` e `use-register.ts` (remover userActions)
3. Reescrever `get-user.ts` e `user-query.ts`
4. Simplificar `use-user.ts`
5. Adicionar `credentials: "include"` no `FetchHttpClient`
6. Atualizar `session-store.ts` com invalidação + redirect
7. Deletar arquivos de user storage
8. Limpar barrels e imports órfãos
9. `turbo check-types` + `bun run lint`

Rollback: git revert — nenhuma mudança de schema ou migração envolvida.

## Open Questions

*(nenhuma — escopo fechado)*
