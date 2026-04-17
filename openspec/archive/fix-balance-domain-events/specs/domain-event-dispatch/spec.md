## MODIFIED Requirements

### Requirement: Domain events are dispatched after entity persistence

The use-case SHALL return the original entity instance (with domain events attached) after successful persistence, so that the service layer can dispatch events from it.

The `DomainEventDispatcher.dispatchAll()` SHALL receive an aggregate with a non-empty `domainEvents` array when the use-case added events prior to persistence.

#### Scenario: Bank account creation dispatches BankAccountCreatedEvent

- **WHEN** `CreateBankAccountUseCase.execute()` succeeds and the entity has a `BankAccountCreatedEvent` attached
- **THEN** the returned `Either.value` SHALL be the original `BankAccount` instance with `domainEvents.length >= 1`
- **AND** `CreateBankAccountService.execute()` SHALL call `dispatcher.dispatchAll(result.value)` which dispatches the event

#### Scenario: Bank account creation fails validation

- **WHEN** `CreateBankAccountUseCase.execute()` returns a failure (validation error)
- **THEN** no domain events SHALL be dispatched
- **AND** no entity SHALL be persisted

### Requirement: Event names use static string constants

Domain event classes SHALL define a `static readonly eventName: string` property containing the event's canonical name. Event listeners SHALL use this static property in `@OnEvent()` decorators instead of the runtime `.name` property.

#### Scenario: BankAccountCreatedEvent uses static eventName

- **WHEN** `OnBankAccountCreatedListener` registers its event handler
- **THEN** the `@OnEvent()` decorator SHALL use `BankAccountCreatedEvent.eventName`
- **AND** `BankAccountCreatedEvent.eventName` SHALL equal `"BankAccountCreatedEvent"`
