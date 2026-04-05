## ADDED Requirements

### Requirement: DomainEvent interface
The system SHALL provide a `DomainEvent` interface in `shared/domain/events/` with:
- `occurredAt: Date` — timestamp of when the event was raised
- `getAggregateId(): Id` — links back to the source aggregate

This interface MUST have zero framework dependencies.

#### Scenario: Concrete event implements DomainEvent
- **WHEN** a class `TransactionCreatedEvent implements DomainEvent`
- **THEN** TypeScript SHALL enforce `occurredAt` and `getAggregateId()` are present

### Requirement: DomainEventDispatcher abstract class
The system SHALL provide an abstract `DomainEventDispatcher` class in `shared/domain/events/` with:
- `abstract dispatch(event: DomainEvent): Promise<void>`
- `abstract dispatchAll(aggregate: AggregateRoot<unknown>): Promise<void>`

This MUST be an abstract class (not interface) to serve as a NestJS DI injection token.

#### Scenario: Injectable as DI token
- **WHEN** a NestJS service declares `constructor(private dispatcher: DomainEventDispatcher)`
- **THEN** NestJS DI SHALL resolve it to the registered concrete implementation

#### Scenario: dispatchAll processes all aggregate events
- **WHEN** `dispatcher.dispatchAll(aggregate)` is called on an aggregate with 3 buffered events
- **THEN** all 3 events SHALL be dispatched
- **THEN** the aggregate's events SHALL be cleared after dispatch

### Requirement: NestJsEventDispatcher implementation
The system SHALL provide a `NestJsEventDispatcher` class in `core/events/` that:
- Extends `DomainEventDispatcher`
- Is decorated with `@Injectable()`
- Injects `EventEmitter2` from `@nestjs/event-emitter`
- `dispatch(event)` emits via `eventEmitter.emit(event.constructor.name, event)`
- `dispatchAll(aggregate)` iterates `aggregate.domainEvents`, dispatches each, then calls `aggregate.clearEvents()`

#### Scenario: Event emitted with constructor name as event key
- **WHEN** `dispatcher.dispatch(new TransactionCreatedEvent(...))` is called
- **THEN** `EventEmitter2.emit` SHALL be called with `"TransactionCreatedEvent"` as the event name

#### Scenario: dispatchAll clears aggregate events
- **WHEN** `dispatcher.dispatchAll(aggregate)` completes
- **THEN** `aggregate.domainEvents.length` SHALL be `0`

### Requirement: EventsModule global module
The system SHALL provide an `EventsModule` in `core/events/` that:
- Is decorated with `@Global()` and `@Module()`
- Imports `EventEmitterModule.forRoot()` from `@nestjs/event-emitter`
- Provides `{ provide: DomainEventDispatcher, useClass: NestJsEventDispatcher }`
- Exports `DomainEventDispatcher`

The module MUST be registered in `AppModule` imports before any domain modules.

#### Scenario: DomainEventDispatcher available globally
- **WHEN** `EventsModule` is imported in `AppModule`
- **THEN** any module's service SHALL be able to inject `DomainEventDispatcher` without importing `EventsModule`

#### Scenario: AppModule registration order
- **WHEN** `AppModule` is configured
- **THEN** `EventsModule` SHALL appear in imports after `DatabaseModule` and before `AuthModule`
