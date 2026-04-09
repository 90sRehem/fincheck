---
id: 03-roadmap-implementacao
aliases:
  - fincheck-roadmap
tags:
  - projeto
  - fincheck
  - roadmap
created_at:
  date: 07/04/2026
status: ativo
type: planejamento
---

# Roadmap de Implementacao

## Visao Geral

Roadmap organizado em **fases incrementais**, cada uma entregando valor funcional.
A prioridade segue o mapeamento de dominios (`02-dominios-subdominios.md`) e os requisitos (`01-requisitos.md`).

**Estado atual do projeto:**

- Infraestrutura core completa (auth, database, env, events)
- Domain kernel implementado (Entity, AggregateRoot, ValueObject, Either, WatchedList)
- Frontend SPA funcional com login, dashboard, transacoes UI, accounts UI, balance
- Design system com 28 componentes (18 ui + 10 patterns)
- Zero modulos de negocio no backend (apenas auth via better-auth)

---

## Fase 0 — Alinhamento Frontend <> Backend (Pre-requisito)

> O frontend aponta para `localhost:8000` (mock). O backend real roda na porta `3333`. Antes de qualquer feature, e preciso conectar os dois.

| # | Tarefa | Escopo | Verificacao |
|---|--------|--------|-------------|
| 0.1 | Apontar `api-client.ts` para o backend NestJS (`localhost:3333/api`) | `apps/web` | Request chega no NestJS |
| 0.2 | Migrar autenticacao do frontend para usar better-auth (cookies/session) em vez de Bearer token manual | `apps/web` | Login funciona end-to-end |
| 0.3 | Corrigir RegisterPage — conectar `useRegisterMutation` ao formulario | `apps/web` | Registro cria usuario no banco |
| 0.4 | Limpar `shared/lib/auth/` (diretorio vazio) | `apps/web` | Sem diretorio orfao |

**Depende de:** nada
**Desbloqueia:** todas as fases seguintes

---

## Fase 1 — Contas Bancarias (RF01)

> Ja tem OpenSpec completo em `openspec/changes/add-bank-accounts-module/`. Seguir as 9 task groups definidas.

| # | Tarefa | Escopo | Subdominio |
|---|--------|--------|------------|
| 1.1 | Schema Drizzle `bank_accounts` + migracao | `apps/api` | Accounts & Wallets |
| 1.2 | Entidade `BankAccount` + Value Objects (tipo, cor) | `apps/api` | Accounts & Wallets |
| 1.3 | Repositorio abstrato + implementacao Drizzle | `apps/api` | Accounts & Wallets |
| 1.4 | Use cases: Create, List, Update, Delete | `apps/api` | Accounts & Wallets |
| 1.5 | Controllers + modulo NestJS | `apps/api` | Accounts & Wallets |
| 1.6 | Conectar frontend existente (accounts-list, add-accounts) ao backend real | `apps/web` | Accounts & Wallets |

**Depende de:** Fase 0
**Desbloqueia:** Fase 2, Fase 3

---

## Fase 2 — Categorias (RF03)

> Pre-requisito para transacoes. Categorias precisam existir antes de classificar despesas/receitas.

| # | Tarefa | Escopo | Subdominio |
|---|--------|--------|------------|
| 2.1 | Schema `categories` (nome, icone, tipo receita/despesa, cor, user_id) | `apps/api` | Financas Pessoais |
| 2.2 | Seed de categorias padrao (Alimentacao, Transporte, Salario, etc.) | `apps/api` | Financas Pessoais |
| 2.3 | CRUD use cases + controllers | `apps/api` | Financas Pessoais |
| 2.4 | Conectar frontend (selects de categoria nos formularios) | `apps/web` | Financas Pessoais |

**Depende de:** Fase 1 (contas existem para vincular)
**Desbloqueia:** Fase 3

---

## Fase 3 — Transacoes (RF02) — CORE

> O frontend ja tem UI completa (add-expense, add-revenue, transactions-list, update, remove, filtros). Falta o backend.

| # | Tarefa | Escopo | Subdominio |
|---|--------|--------|------------|
| 3.1 | Schema `transactions` (valor, tipo, categoria_id, conta_id, data, descricao) | `apps/api` | Financas Pessoais |
| 3.2 | Entidade `Transaction` + validacoes de dominio | `apps/api` | Financas Pessoais |
| 3.3 | Use cases: Create, List (com paginacao infinita), Update, Delete | `apps/api` | Financas Pessoais |
| 3.4 | Atualizacao automatica de saldo da conta ao criar/editar/excluir transacao | `apps/api` | Accounts & Wallets |
| 3.5 | Endpoint de balanco (receitas vs despesas por periodo) | `apps/api` | Financas Pessoais |
| 3.6 | Conectar frontend existente ao backend real | `apps/web` | Financas Pessoais |

**Depende de:** Fase 1, Fase 2
**Desbloqueia:** Fases 4, 5, 6, 7 (podem paralelizar)

---

## Fase 4 — User Profile & Settings

> O ERD do User Aggregate (`user-aggregate-erd.md`) define Profiles e Settings, mas nada esta implementado alem da tabela `users` do better-auth.

| # | Tarefa | Escopo | Subdominio |
|---|--------|--------|------------|
| 4.1 | Schema `profiles` + `settings` (conforme ERD) | `apps/api` | Auth & Users |
| 4.2 | Use case: GetUserProfile, UpdateProfile, UpdateSettings | `apps/api` | Auth & Users |
| 4.3 | Pagina de perfil/configuracoes no frontend | `apps/web` | Auth & Users |
| 4.4 | Suporte a moeda, timezone, idioma (base para i18n) | `apps/web` | Auth & Users |

**Depende de:** Fase 0 (auth funcional)
**Desbloqueia:** nada (pode paralelizar com Fases 5-8 apos Fase 3)

---

## Fase 5 — Orcamentos e Metas (RF03/Metas)

> Depende de Categorias e Transacoes existirem.

| # | Tarefa | Escopo | Subdominio |
|---|--------|--------|------------|
| 5.1 | Schema `budgets` (categoria_id, valor_limite, periodo) | `apps/api` | Financas Pessoais |
| 5.2 | Schema `goals` (nome, valor_alvo, valor_atual, prazo) | `apps/api` | Financas Pessoais |
| 5.3 | Use cases: CRUD de orcamentos + verificacao de limite | `apps/api` | Financas Pessoais |
| 5.4 | Use cases: CRUD de metas + calculo de progresso | `apps/api` | Financas Pessoais |
| 5.5 | UI: tela de orcamentos por categoria + barra de progresso | `apps/web` | Financas Pessoais |
| 5.6 | UI: tela de metas + progresso visual | `apps/web` | Financas Pessoais |

**Depende de:** Fase 2 (categorias), Fase 3 (transacoes)
**Desbloqueia:** Fase 8 (notificacoes reagem a eventos de orcamento/meta)

---

## Fase 6 — Recorrencias (RF05)

> Transacoes recorrentes (salario, aluguel, assinaturas).

| # | Tarefa | Escopo | Subdominio |
|---|--------|--------|------------|
| 6.1 | Schema `recurring_transactions` (frequencia, proxima data, ativa) | `apps/api` | Financas Pessoais |
| 6.2 | Job/cron para gerar transacoes automaticamente | `apps/api` | Financas Pessoais |
| 6.3 | UI: gestao de recorrencias (listar, pausar, editar) | `apps/web` | Financas Pessoais |

**Depende de:** Fase 3 (transacoes)
**Desbloqueia:** Fase 8 (notificacoes de lembretes de recorrencias)

---

## Fase 7 — Relatorios e Dashboards (RF04)

> Depende de transacoes com volume de dados.

| # | Tarefa | Escopo | Subdominio |
|---|--------|--------|------------|
| 7.1 | Endpoints de agregacao (despesas por categoria, evolucao mensal, receita vs despesa) | `apps/api` | Reports & Analytics |
| 7.2 | Graficos: evolucao de saldo, pizza de categorias, barras comparativas | `apps/web` | Reports & Analytics |
| 7.3 | Filtros por periodo, conta, categoria | `apps/web` | Reports & Analytics |

**Depende de:** Fase 3 (transacoes)
**Desbloqueia:** nada

---

## Fase 8 — Notificacoes (RF08)

> Alertas de orcamentos estourados, metas atingidas, lembretes de recorrencias.

| # | Tarefa | Escopo | Subdominio |
|---|--------|--------|------------|
| 8.1 | Event handlers para eventos de dominio (BudgetExceeded, GoalReached, RecurringDue) | `apps/api` | Notifications |
| 8.2 | Schema `notifications` + canal in-app | `apps/api` | Notifications |
| 8.3 | UI: painel de notificacoes no header | `apps/web` | Notifications |
| 8.4 | Push/email (opcional, futuro) | `apps/api` | Notifications |

**Depende de:** Fase 5 (orcamentos/metas), Fase 6 (recorrencias)
**Desbloqueia:** nada

---

## Fase 9 — Importacao de Dados (RF06) — Futuro

> Baixa prioridade, marcado como "futuro" nos requisitos.

| # | Tarefa | Escopo | Subdominio |
|---|--------|--------|------------|
| 9.1 | Importacao de CSV/OFX | `apps/api` | Integrations |
| 9.2 | UI: upload + mapeamento de colunas | `apps/web` | Integrations |
| 9.3 | Open Finance (se viavel) | `apps/api` | Integrations |

**Depende de:** Fase 1 (contas), Fase 2 (categorias)
**Desbloqueia:** nada

---

## Grafo de Dependencias

```
Fase 0 (alinhamento)
  └─> Fase 1 (contas)
       └─> Fase 2 (categorias)
            └─> Fase 3 (transacoes) ← CORE
                 ├─> Fase 4 (perfil/settings) — pode paralelizar
                 ├─> Fase 5 (orcamentos/metas)
                 │    └─> Fase 8 (notificacoes)
                 ├─> Fase 6 (recorrencias)
                 │    └─> Fase 8 (notificacoes)
                 └─> Fase 7 (relatorios)
Fase 9 (importacao) — independente, baixa prioridade
```

**Fases 4, 5, 6 e 7 podem ser desenvolvidas em paralelo** apos a Fase 3.
A Fase 8 depende de 5 e 6 pois reage a eventos desses dominios.

---

## Mapeamento Requisitos → Fases

| Requisito | Descricao | Fase |
|-----------|-----------|------|
| RF01 | Contas e Carteiras | Fase 1 |
| RF02 | Transacoes | Fase 3 |
| RF03 | Categorias | Fase 2 |
| RF03 | Metas e Objetivos | Fase 5 |
| RF04 | Relatorios e Dashboards | Fase 7 |
| RF05 | Recorrencias | Fase 6 |
| RF06 | Sincronizacao Bancaria | Fase 9 |
| RF07 | Autenticacao | Implementado (better-auth) |
| RF08 | Notificacoes | Fase 8 |

## Links Relacionados

- [[1759607068-00-visao-geral]]
- [[1759610610-01-requisitos]]
- [[1760055212-02-dominios-subdominios]]
- [[user-aggregate-erd]]
