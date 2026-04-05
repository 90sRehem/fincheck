import type { DomainEvent } from "../events/domain-event";
import { Entity, type EntityProps } from "./entity";

export abstract class AggregateRoot<T> extends Entity<T> {
	private _domainEvents: DomainEvent[] = [];

	protected constructor(props: T & EntityProps, id?: string) {
		super(props, id);
	}

	get domainEvents(): DomainEvent[] {
		return this._domainEvents;
	}

	addDomainEvent(event: DomainEvent): void {
		this._domainEvents.push(event);
	}

	clearEvents(): void {
		this._domainEvents = [];
	}
}
