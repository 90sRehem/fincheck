import { AggregateRoot } from "@/shared/domain/entities/aggregate-root";
import type { Either } from "@/shared/domain/types/either";
import { ValidationFieldsError } from "@/shared/domain/validators/validation-fields-error";
import {
	BankAccountProps,
	BankAccountValidator,
} from "../validators/bank-account.validator";

export type { BankAccountProps } from "../validators/bank-account.validator";

interface BankAccountEntityProps extends BankAccountProps {
	createdAt: Date;
	updatedAt: Date;
}

export class BankAccount extends AggregateRoot<BankAccountEntityProps> {
	constructor(props: BankAccountEntityProps, id?: string) {
		super(props, id);
		this.props.createdAt = props.createdAt ?? new Date();
		this.props.updatedAt = props.updatedAt ?? new Date();
	}

	validate(): Either<ValidationFieldsError, void> {
		const validator = new BankAccountValidator();
		return validator.validate(this.props);
	}

	get userId(): string {
		return this.props.userId;
	}

	get name(): string {
		return this.props.name;
	}

	get accountType() {
		return this.props.accountType;
	}

	get initialBalance(): number {
		return this.props.initialBalance;
	}

	get currency() {
		return this.props.currency;
	}

	get color() {
		return this.props.color;
	}

	get icon(): string | null {
		return this.props.icon;
	}

	override update(
		props: Partial<Omit<BankAccountProps, "userId" | "initialBalance">>,
	): void {
		this.props = {
			...this.props,
			...props,
		};
		this.props.updatedAt = new Date();
	}
}
