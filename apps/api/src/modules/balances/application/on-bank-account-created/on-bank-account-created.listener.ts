import { Injectable, Logger } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { BankAccountCreatedEvent } from "@/shared/domain/events";
import { Balance, BalanceRepository } from "../../domain";

@Injectable()
export class OnBankAccountCreatedListener {
	private readonly logger = new Logger(OnBankAccountCreatedListener.name);

	constructor(private readonly balanceRepository: BalanceRepository) {}

	@OnEvent(BankAccountCreatedEvent.eventName)
	async handle(event: BankAccountCreatedEvent): Promise<void> {
		try {
			const balance = Balance.fromAccountCreated(event);

			const validationResult = balance.validate();
			if (validationResult.isFailure) {
				this.logger.error(
					`Balance validation failed for account ${event.getAggregateId().toString()}: ${JSON.stringify(validationResult.value)}`,
				);
				return;
			}

			await this.balanceRepository.create(balance);
		} catch (error) {
			this.logger.error(
				`Failed to create balance for account ${event.getAggregateId().toString()}: ${error}`,
			);
		}
	}
}
