import type { Id } from "../value-objects/id";
import type { DomainEvent } from "./domain-event";

export class BankAccountCreatedEvent implements DomainEvent {
	static readonly eventName = "BankAccountCreatedEvent";
	readonly occurredAt: Date;

	constructor(
		readonly aggregateId: Id,
		readonly userId: string,
		readonly initialBalance: number,
		readonly currencyId: string,
	) {
		this.occurredAt = new Date();
	}

	getAggregateId(): Id {
		return this.aggregateId;
	}
}
