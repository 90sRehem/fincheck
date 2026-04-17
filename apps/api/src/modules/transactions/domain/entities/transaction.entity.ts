import { AggregateRoot } from "@/shared/domain/entities/aggregate-root";
import type { Either } from "@/shared/domain/types/either";
import { ValidationFieldsError } from "@/shared/domain/validators/validation-fields-error";
import {
	TransactionProps,
	TransactionValidator,
} from "../validators/transaction.validator";

export type { TransactionProps } from "../validators/transaction.validator";

interface TransactionEntityProps extends TransactionProps {
	createdAt: Date;
	updatedAt: Date;
}

export class Transaction extends AggregateRoot<TransactionEntityProps> {
	constructor(props: TransactionEntityProps, id?: string) {
		super(props, id);
		this.props.createdAt = props.createdAt ?? new Date();
		this.props.updatedAt = props.updatedAt ?? new Date();
	}

	validate(): Either<ValidationFieldsError, void> {
		const validator = new TransactionValidator();
		return validator.validate(this.props);
	}

	get userId(): string {
		return this.props.userId;
	}

	get accountId(): string {
		return this.props.accountId;
	}

	get title(): string {
		return this.props.title;
	}

	get amountCents(): number {
		return this.props.amountCents;
	}

	get type(): TransactionProps["type"] {
		return this.props.type;
	}

	get color(): string {
		return this.props.color;
	}

	get category(): string | null {
		return this.props.category;
	}

	get date(): Date {
		return this.props.date;
	}

	override get createdAt(): Date {
		return this.props.createdAt;
	}

	override get updatedAt(): Date {
		return this.props.updatedAt;
	}

	override update(props: Partial<Omit<TransactionProps, "userId">>): void {
		this.props = {
			...this.props,
			...props,
		};
		this.props.updatedAt = new Date();
	}
}
