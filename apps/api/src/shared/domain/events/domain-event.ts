import { Id } from "../value-objects/id";

export interface DomainEvent {
	readonly occurredAt: Date;
	getAggregateId(): Id;
}
