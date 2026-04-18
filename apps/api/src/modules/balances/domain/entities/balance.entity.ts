import { Entity } from "@/shared/domain/entities/entity";
import type { BankAccountCreatedEvent } from "@/shared/domain/events";
import type { Either } from "@/shared/domain/types/either";
import type { ValidationFieldsError } from "@/shared/domain/validators/validation-fields-error";
import { BalanceValidator } from "../validators/balance.validator";

const CENTS_PER_UNIT = 100;

export interface BalanceProps {
	userId: string;
	bankAccountId: string;
	amountCents: number;
	currency: string;
}

interface BalanceEntityProps extends BalanceProps {
	createdAt: Date;
	updatedAt: Date;
}

export class Balance extends Entity<BalanceEntityProps> {
	constructor(props: BalanceEntityProps, id?: string) {
		super(props, id);
	}

	validate(): Either<ValidationFieldsError, void> {
		const validator = new BalanceValidator();
		return validator.validate(this.props);
	}

	get userId(): string {
		return this.props.userId;
	}

	get bankAccountId(): string {
		return this.props.bankAccountId;
	}

	get amountCents(): number {
		return this.props.amountCents;
	}

	get currency(): string {
		return this.props.currency;
	}

	static fromAccountCreated(event: BankAccountCreatedEvent): Balance {
		return new Balance(
			{
				userId: event.userId,
				bankAccountId: event.getAggregateId().toString(),
				amountCents: Math.round(event.initialBalance * CENTS_PER_UNIT),
				currency: event.currencyId,
				createdAt: new Date(),
				updatedAt: new Date(),
			},
			crypto.randomUUID(),
		);
	}
}
