# Proposta: Migrar campo color de hex para colorId

**Change:** `color-id-migration`
**Data:** 2026-04-18
**Escopo:** `apps/api` (bank-accounts module) + `apps/web` (home page)

## Motivacao

Atualmente o sistema persiste hex strings (`"#40C057"`) na coluna `color` de `bank_accounts`.
Isso e problematico por dois motivos:

1. **Inconsistencia com o design system** — O componente `CardLarge` do design system aceita **nomes de cor** (`"green"`, `"indigo"`) como prop `color`, nao hex. O frontend faz cast (`account.color as Colors`) que funciona por acidente quando o hex coincide, mas semanticamente esta errado.

2. **Fragilidade** — Se uma cor mudar de hex no seed, todos os registros antigos ficam orfaos. Armazenar o `id` da cor (que e a PK da tabela `colors`) torna o sistema resiliente a mudancas visuais.

3. **Simplificacao** — A validacao Zod de hex regex no backend e desnecessaria se armazenarmos o ID. A validacao pode ser simplesmente `z.string().min(1)`, e opcionalmente validar contra os IDs existentes via lookup.

## Impacto

- **Breaking change na API** — O campo `color` no body de `POST /api/v1/bank-accounts` e `PATCH /api/v1/bank-accounts/:id` passa a esperar um ID de cor (ex: `"green"`) em vez de hex (ex: `"#40C057"`).
- **Sem migration de dados** — Contas existentes ja criadas com hex ficam como estao (escopo futuro: script de correcao). Para MVP, apenas novas contas usam o novo formato.
- **Sem mudanca no schema Drizzle** — Coluna `color: text` continua como esta; muda apenas o conteudo armazenado.
- **Sem renomear coluna** — O campo continua se chamando `color` no banco, DTO e entity. O valor semantico muda de hex para ID.

## Decisoes

| Decisao | Justificativa |
|---------|---------------|
| Manter nome da coluna `color` | Evita migration DDL, menos risco |
| Nao renomear campo no DTO para `colorId` | Manter compatibilidade com frontend existente; o campo se chama `color` em todos os contratos |
| Validacao simples `z.string().min(1)` | IDs sao strings curtas deterministicas, nao precisam de regex |
| Nao migrar dados antigos neste escopo | Simplifica a change; pode ser feito depois com script |

## Commit sugerido

```
feat(web,api): migra campo color para armazenar id da cor em bank-accounts
```

## Learnings incorporados

- `color-system.md` — Fluxo end-to-end, tabela colors (`{ id, name, hex }`), bug fix anterior (hex vs id), arquivos relevantes com linhas exatas.
- Vault logs `2026-04-18-fix-color-bank-account.md` e `2026-04-18-bank-account-creation-flow.md` — Contexto completo do fluxo de criacao e validacao.
