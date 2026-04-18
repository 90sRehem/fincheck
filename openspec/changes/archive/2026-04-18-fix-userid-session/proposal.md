# Proposal: fix-userid-session

## Problema

O decorator `@Session()` de `@thallesp/nestjs-better-auth` retorna um objeto do tipo `UserSession` com a estrutura:

```ts
{
  user: { id: string; name: string; email: string; role?: string | string[]; ... },
  session: { id: string; token: string; userId: string; expiresAt: Date; activeOrganizationId?: string; ... }
}
```

Porém, **7 de 8 endpoints** tipam o parâmetro como `{ userId: string }` e acessam `session.userId` — que resulta em `undefined` em runtime, pois `userId` vive dentro de `session.session.userId` ou, mais corretamente, o ID do usuário vive em `session.user.id`.

Apenas `CreateBankAccountController` já usa o tipo correto: `{ user: { id: string } }` com acesso via `session.user.id`.

## Causa raiz

Não existe um tipo compartilhado `AuthSession` no projeto. Cada controller define inline o shape esperado, e a maioria usou uma versão simplificada incorreta (`{ userId: string }`) que não reflete a estrutura real do `UserSession` exportado pela biblioteca.

## Impacto

- **Todos os endpoints protegidos** (exceto create bank-account) passam `undefined` como `userId` para os services/use-cases.
- Queries ao banco retornam vazias ou falham silenciosamente quando filtram por `userId = undefined`.
- Bug crítico em produção: listagens vazias, operações que não encontram recursos.

## Solução proposta

1. Criar tipo `AuthSession` em `apps/api/src/core/auth/types.ts` re-exportando/simplificando `UserSession` da lib.
2. Atualizar o barrel `core/auth/index.ts` para exportar o novo tipo.
3. Corrigir todos os controllers para usar `AuthSession` e acessar `session.user.id`.

## Escopo

- **8 arquivos** a alterar (1 novo + 1 barrel + 6 controllers)
- **0 mudanças** em domain/application/infra — apenas presentation layer
- **Risco:** baixo — mudança mecânica com shape verificável via type-checking

## Commit sugerido

```
fix(api): corrige tipo AuthSession e acesso ao userId nos controllers
```
