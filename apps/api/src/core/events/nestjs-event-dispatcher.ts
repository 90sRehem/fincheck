import { Injectable } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import type { DomainEvent } from "@/shared/domain/events/domain-event";
import { DomainEventDispatcher } from "@/shared/domain/events/domain-event-dispatcher";

@Injectable()
export class NestJsEventDispatcher extends DomainEventDispatcher {
	constructor(private readonly eventEmitter: EventEmitter2) {
		super();
	}

	async dispatch(event: DomainEvent): Promise<void> {
		await this.eventEmitter.emit(event.constructor.name, event);
	}

	async dispatchAll(aggregate: {
		domainEvents: DomainEvent[];
		clearEvents(): void;
	}): Promise<void> {
		for (const event of aggregate.domainEvents) {
			await this.dispatch(event);
		}
		aggregate.clearEvents();
	}
}
