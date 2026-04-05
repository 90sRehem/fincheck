## ADDED Requirements

### Requirement: ValueObject base class
The system SHALL provide an abstract `ValueObject<T>` class that wraps an immutable value of type `T`. The wrapped value MUST be `protected readonly`. Equality MUST be structural (comparing values), not referential. The class MUST provide a `toString()` method returning the JSON-stringified value.

#### Scenario: Two ValueObjects with same value are equal
- **WHEN** two ValueObject instances are created with the same wrapped value
- **THEN** `vo1.equals(vo2)` SHALL return `true`

#### Scenario: Two ValueObjects with different values are not equal
- **WHEN** two ValueObject instances are created with different wrapped values
- **THEN** `vo1.equals(vo2)` SHALL return `false`

#### Scenario: ValueObject is immutable
- **WHEN** a ValueObject is created with a value
- **THEN** the wrapped value MUST NOT be reassignable (protected readonly)

### Requirement: Id value object
The system SHALL provide an `Id` class extending `ValueObject<string>` that wraps a UUID string. The constructor MUST generate a new UUID via `crypto.randomUUID()` when no value is provided. The class MUST provide a static `fromString(value: string)` factory method that validates non-empty strings. `toString()` MUST return the raw UUID string.

#### Scenario: Id auto-generates UUID
- **WHEN** an Id is created without arguments
- **THEN** the Id SHALL contain a valid UUIDv4 string

#### Scenario: Id from existing string
- **WHEN** `Id.fromString("abc-123")` is called
- **THEN** the Id SHALL wrap that exact string value

#### Scenario: Id from empty string throws
- **WHEN** `Id.fromString("")` is called
- **THEN** the system SHALL throw an error

#### Scenario: Id equality
- **WHEN** two Id instances are created from the same string
- **THEN** `id1.equals(id2)` SHALL return `true`

### Requirement: Entity base class
The system SHALL provide an abstract `Entity<T>` class that:
- Stores identity as `_id: Id` (ValueObject)
- Auto-generates a new Id if none provided in constructor
- Stores `createdAt` and `updatedAt` timestamps, defaulting to `new Date()`
- Provides an `update(props: Partial<T>)` method that shallow-merges props and bumps `updatedAt`
- Provides `equals(entity)` that compares by identity only
- Provides `toJSON()` returning `{ id, ...props }`
- Declares `abstract validate(): Either<ValidationFieldsError, void>`

#### Scenario: Entity auto-generates Id
- **WHEN** an Entity is created without providing an id
- **THEN** the Entity SHALL have a new UUID as its id

#### Scenario: Entity with provided Id
- **WHEN** an Entity is created with an existing id string
- **THEN** the Entity SHALL use that id wrapped in an Id value object

#### Scenario: Entity equality by identity
- **WHEN** two entities have the same id but different props
- **THEN** `entity1.equals(entity2)` SHALL return `true`

#### Scenario: Entity update bumps updatedAt
- **WHEN** `entity.update({ name: "new" })` is called
- **THEN** the entity's `updatedAt` SHALL be more recent than before the update
- **THEN** the entity's `name` prop SHALL be `"new"`

#### Scenario: Entity validate is enforced
- **WHEN** a concrete Entity subclass does not implement `validate()`
- **THEN** TypeScript SHALL produce a compilation error

### Requirement: AggregateRoot base class
The system SHALL provide an abstract `AggregateRoot<T>` extending `Entity<T>` that:
- Maintains a private `_domainEvents: DomainEvent[]` array
- Provides `addDomainEvent(event: DomainEvent)` that pushes to the array (no static registry)
- Provides a readonly `domainEvents` getter returning the array
- Provides `clearEvents()` that empties the array

#### Scenario: AggregateRoot accumulates events
- **WHEN** `aggregate.addDomainEvent(event1)` and `aggregate.addDomainEvent(event2)` are called
- **THEN** `aggregate.domainEvents` SHALL contain `[event1, event2]`

#### Scenario: AggregateRoot clears events
- **WHEN** `aggregate.clearEvents()` is called after adding events
- **THEN** `aggregate.domainEvents` SHALL be an empty array

#### Scenario: AggregateRoot does not use static dispatcher
- **WHEN** `addDomainEvent()` is called
- **THEN** no global/static side effect SHALL occur — only the internal array is modified

### Requirement: WatchedList base class
The system SHALL provide an abstract `WatchedList<T>` class that tracks changes to a collection. It MUST:
- Store `currentItems`, track `newItems` (added since initial), and `removedItems` (removed since initial)
- Declare `abstract compareItems(a: T, b: T): boolean` for identity comparison
- Provide `add(item)` that handles re-adding previously removed items
- Provide `remove(item)` that handles removing newly added items without marking as "removed"
- Provide `update(items: T[])` for bulk replacement that computes diffs
- Provide `getItems()` returning current items

#### Scenario: WatchedList tracks new items
- **WHEN** an item is added that was not in the initial list
- **THEN** `newItems` SHALL contain that item
- **THEN** `currentItems` SHALL contain that item

#### Scenario: WatchedList tracks removed items
- **WHEN** an item from the initial list is removed
- **THEN** `removedItems` SHALL contain that item
- **THEN** `currentItems` SHALL NOT contain that item

#### Scenario: WatchedList re-add removed item
- **WHEN** a previously removed item is added back
- **THEN** `removedItems` SHALL NOT contain that item
- **THEN** `currentItems` SHALL contain that item

#### Scenario: WatchedList remove newly added item
- **WHEN** a newly added item (not in initial list) is removed
- **THEN** `newItems` SHALL NOT contain that item
- **THEN** `removedItems` SHALL NOT contain that item (it was never in the initial list)

#### Scenario: WatchedList bulk update computes diff
- **WHEN** `update([itemA, itemC])` is called on a list initially containing `[itemA, itemB]`
- **THEN** `newItems` SHALL contain `[itemC]`
- **THEN** `removedItems` SHALL contain `[itemB]`
- **THEN** `currentItems` SHALL contain `[itemA, itemC]`
