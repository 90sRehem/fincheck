---
id: 1760055212-02-dominios-subdominios
aliases: []
tags:
  - fincheck
  - domain
  - subdomain
  - project
---

# Domínios e Subdomínios

## 🎯 Domínio Principal

**Nome:** Finanças Pessoais (Transactions & Budgets)
**Descrição:** Coração do sistema — criação, classificação e acompanhamento de transações, metas e orçamentos.
**Responsabilidade Central:** Gerenciar transações e orçamentos de um usuário

## 🧩 Subdomínios

| Nome                        | Tipo       | Descrição                                                                 | Complexidade | Prioridade |
| --------------------------- | ---------- | ------------------------------------------------------------------------- | ------------ | ---------- |
| Finanças Pessoais           | Core       | Criação, classificação e acompanhamento de transações, metas e orçamentos | Alta         | Alta       |
| Accounts & Wallets          | Supporting | Gerencia carteiras e saldos. Suporta o domínio principal                  | Média        | Alta       |
| Reports & Analytics         | Supporting | Gera relatórios, dashboards e projeções                                   | Média        | Média      |
| Notifications               | Supporting | Trata alertas e lembretes baseados em eventos do domínio principal        | Baixa        | Baixa      |
| Authentication & Users      | Generic    | Parte genérica e reutilizável para autenticação e gestão de usuários      | Baixa        | Alta       |
| Integrations (Bancos / CSV) | Generic    | Subdomínio técnico de importação/exportação de dados                      | Média        | Média      |

### 📖 Tipos de Subdomínios

**🎯 Core (Núcleo):** Subdomínios que representam a diferenciação competitiva do negócio  
**🛠️ Supporting (Suporte):** Subdomínios necessários mas não são o core business  
**⚙️ Generic (Genérico):** Subdomínios commoditizados, sem diferenciação

## 🏗️ Contextos Delimitados (Bounded Contexts)

### Gestão Financeira

**Subdomínio:** Finanças Pessoais  
**Responsabilidades:**

- Registrar transações de entrada e saída
- Categorizar transações por tipo (receita/despesa)
- Criar e gerenciar metas financeiras
- Controlar orçamentos por categoria
- Calcular saldos e projeções

**Entidades Principais:**

- Transaction (Transação)
- Category (Categoria)
- Budget (Orçamento)
- Goal (Meta)

**Linguagem Ubíqua:**

- **Transação**: Registro de movimentação financeira (entrada ou saída)
- **Categoria**: Classificação de uma transação (ex: alimentação, transporte)
- **Orçamento**: Limite de gastos definido para uma categoria em um período
- **Meta**: Objetivo financeiro com valor e prazo definidos

### Gerenciamento de Contas

**Subdomínio:** Accounts & Wallets  
**Responsabilidades:**

- Criar e gerenciar carteiras/contas
- Manter saldos atualizados
- Controlar tipos de conta (corrente, poupança, cartão)
- Sincronizar saldos com transações

**Entidades Principais:**

- Account (Conta)
- Wallet (Carteira)
- Balance (Saldo)

**Linguagem Ubíqua:**

- **Conta**: Representação de uma conta bancária ou carteira
- **Carteira**: Agrupamento lógico de contas
- **Saldo**: Valor atual disponível em uma conta

### Relatórios e Análises

**Subdomínio:** Reports & Analytics  
**Responsabilidades:**

- Gerar relatórios de gastos por período
- Criar dashboards com métricas financeiras
- Analisar tendências de gastos
- Projetar cenários futuros

**Entidades Principais:**

- Report (Relatório)
- Dashboard (Painel)
- Metric (Métrica)

**Linguagem Ubíqua:**

- **Relatório**: Documento com análise financeira de um período
- **Dashboard**: Painel visual com métricas em tempo real
- **Métrica**: Indicador financeiro calculado (ex: taxa de economia)

### Autenticação

**Subdomínio:** Authentication & Users  
**Responsabilidades:**

- Autenticar usuários
- Gerenciar sessões
- Controlar permissões de acesso
- Manter dados de perfil

**Entidades Principais:**

- User (Usuário)
- Session (Sessão)
- Profile (Perfil)

**Linguagem Ubíqua:**

- **Usuário**: Pessoa que utiliza o sistema
- **Sessão**: Período de acesso autenticado
- **Perfil**: Dados pessoais e preferências do usuário

## 🔄 Relacionamentos Entre Contextos

| Contexto A            | Contexto B              | Tipo de Relacionamento | Descrição                                          |
| --------------------- | ----------------------- | ---------------------- | -------------------------------------------------- |
| Gestão Financeira     | Gerenciamento de Contas | Customer/Supplier      | Gestão Financeira consome dados de saldos e contas |
| Relatórios e Análises | Gestão Financeira       | Customer/Supplier      | Relatórios consomem dados de transações e metas    |
| Autenticação          | Gestão Financeira       | Shared Kernel          | Ambos compartilham conceito de usuário             |
| Gestão Financeira     | Notificações            | Published Language     | Publica eventos para disparar alertas              |

### 📋 Tipos de Relacionamentos

- **Customer/Supplier:** Um contexto depende de outro
- **Conformist:** Um contexto se adapta ao modelo de outro
- **Shared Kernel:** Contextos compartilham um subconjunto do modelo
- **Anti-Corruption Layer:** Camada de proteção entre contextos
- **Published Language:** Interface bem definida entre contextos

## 🌐 Mapa de Contextos

```
         ┌─────────────────────┐
         │    Autenticação     │
         │   (Shared Kernel)   │
         └─────────┬───────────┘
                   │
    ┌──────────────┴──────────────┐
    │                             │
┌───▼─────────────┐    ┌──────────▼──────────┐
│ Gestão          │────│ Gerenciamento       │
│ Financeira      │    │ de Contas           │
│ (Core)          │    │ (Supporting)        │
└─────┬───────────┘    └─────────────────────┘
      │
      ├─────────────────────────────┐
      │                             │
┌─────▼─────────────┐    ┌──────────▼──────────┐
│ Relatórios &      │    │    Notificações     │
│ Analytics         │    │    (Supporting)     │
│ (Supporting)      │    │                     │
└───────────────────┘    └─────────────────────┘
```

## 🔗 Links Relacionados

- [[1759607068-00-visao-geral]]
- [[03 - Modelagem Conceitual]]
- [[07 - Glossário]]
- [[10 - Arquitetura]]
