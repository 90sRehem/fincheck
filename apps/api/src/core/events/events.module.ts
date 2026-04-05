import { Global, Module } from "@nestjs/common";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { DomainEventDispatcher } from "@/shared/domain/events/domain-event-dispatcher";
import { NestJsEventDispatcher } from "./nestjs-event-dispatcher";

@Global()
@Module({
	imports: [
		EventEmitterModule.forRoot({
			delimiter: ".",
			verboseMemoryLeak: true,
		}),
	],
	providers: [
		{
			provide: DomainEventDispatcher,
			useClass: NestJsEventDispatcher,
		},
	],
	exports: [DomainEventDispatcher],
})
export class EventsModule {}
