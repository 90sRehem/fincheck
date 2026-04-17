## MODIFIED Requirements

### Requirement: BalanceMapper handles missing createdAt column

`BalanceMapper.toDomain()` SHALL NOT map `createdAt` from `updatedAt`. When the persistence layer does not provide a `createdAt` value, the `Entity` base class SHALL default it to `new Date()`.

#### Scenario: Balance entity created from database row without createdAt

- **WHEN** `BalanceMapper.toDomain(raw)` is called with a `BalanceRaw` that has no `createdAt` field
- **THEN** the resulting `Balance` entity's `createdAt` SHALL be a `Date` instance defaulted by the `Entity` constructor
- **AND** `createdAt` SHALL NOT equal `raw.updatedAt`

### Requirement: BalanceMapper contains no dead code

`BalanceMapper` SHALL NOT contain methods that are never called. Unused aggregation logic SHALL be removed.

#### Scenario: toAggregatedResponse is removed

- **WHEN** inspecting `BalanceMapper`
- **THEN** the class SHALL NOT contain a `toAggregatedResponse` method
- **AND** all remaining methods SHALL have at least one call site

### Requirement: BalanceMapper uses correct types without defensive casts

`BalanceMapper.toDomain()` SHALL use `amountCents` directly as a `number` without runtime type checking. The Drizzle schema defines `amountCents` as `bigint({ mode: "number" })`, guaranteeing it is always a `number` at runtime.

#### Scenario: amountCents mapped without string check

- **WHEN** `BalanceMapper.toDomain(raw)` processes `raw.amountCents`
- **THEN** it SHALL assign `raw.amountCents` directly without a `typeof === "string"` branch
