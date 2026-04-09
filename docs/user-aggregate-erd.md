# ERD - User Aggregate

```mermaid
erDiagram
    USERS {
        uuid id PK
        timestamp created_at
        timestamp updated_at
        integer version
    }
    
    PROFILES {
        uuid id PK
        uuid user_id FK
        varchar name
        varchar email UK
        varchar phone
        date birth_date
        text profile_picture_url
        timestamp created_at
        timestamp updated_at
    }
    
    SETTINGS {
        uuid id PK
        uuid user_id FK
        varchar currency
        varchar timezone
        varchar language
        varchar theme
        varchar date_format
        integer first_day_of_week
        integer month_closing_day
        boolean notification_email
        boolean notification_push
        integer budget_alert_threshold
        timestamp created_at
        timestamp updated_at
    }
    
    AUTHENTICATION {
        uuid id PK
        uuid user_id FK
        varchar password_hash
        varchar salt
        boolean two_factor_enabled
        varchar two_factor_secret
        timestamp last_login
        integer login_attempts
        timestamp locked_until
        timestamp created_at
        timestamp updated_at
    }
    
    %% Relacionamentos 1:1
    USERS ||--|| PROFILES : "has"
    USERS ||--|| SETTINGS : "has"
    USERS ||--|| AUTHENTICATION : "has"
```

## 🔗 Relacionamentos

| Tabela | Relacionamento | Cardinalidade | Descrição |
|--------|----------------|---------------|-----------|
| USERS → PROFILES | 1:1 | Obrigatório | Cada usuário tem exatamente um perfil |
| USERS → SETTINGS | 1:1 | Obrigatório | Cada usuário tem exatamente uma configuração |
| USERS → AUTHENTICATION | 1:1 | Obrigatório | Cada usuário tem exatamente uma autenticação |

## 🗝️ Constraints

### **Primary Keys**
- Todas as tabelas usam UUID como PK

### **Foreign Keys** 
- `profiles.user_id` → `users.id` (CASCADE DELETE)
- `settings.user_id` → `users.id` (CASCADE DELETE)  
- `authentication.user_id` → `users.id` (CASCADE DELETE)

### **Unique Constraints**
- `profiles.email` (UNIQUE)
- `profiles.user_id` (UNIQUE INDEX)
- `settings.user_id` (UNIQUE INDEX)
- `authentication.user_id` (UNIQUE INDEX)

### **Default Values**
- `settings.currency` = 'BRL'
- `settings.timezone` = 'America/Sao_Paulo'
- `settings.language` = 'pt-BR'
- `settings.theme` = 'light'
- `authentication.two_factor_enabled` = false
- `authentication.login_attempts` = 0

## 🎯 Agregado User

Este ERD representa o **User Aggregate** onde:
- **USERS** é o Aggregate Root
- **PROFILES, SETTINGS, AUTHENTICATION** são entidades internas
- Todas as operações passam pelo User Aggregate Root
- Integridade garantida por CASCADE DELETE