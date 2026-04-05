import { Injectable } from "@nestjs/common";
import type { DomainEvent } from "./domain-event";

@Injectable()
export abstract class DomainEventDispatcher {
	abstract dispatch(event: DomainEvent): Promise<void>;

	abstract dispatchAll(aggregate: {
		domainEvents: DomainEvent[];
		clearEvents(): void;
	}): Promise<void>;
}
