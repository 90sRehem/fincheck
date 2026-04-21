import { AggregateRoot } from "@/shared/domain/entities/aggregate-root";
import type { Either } from "@/shared/domain/types/either";
import { ValidationFieldsError } from "@/shared/domain/validators/validation-fields-error";
import { TransactionValidator } from "../validators/transaction.validator";
import type { TransactionColor } from "../value-objects/transaction-color";
import { TRANSACTION_TYPE } from "../value-objects/transaction-type";

export interface TransactionProps {
	userId: string;
	accountId: string;
	title: string;
	amountCents: number;
	type: (typeof TRANSACTION_TYPE)[keyof typeof TRANSACTION_TYPE];
	color: TransactionColor;
	category: string | null;
	date: Date;
	createdAt: Date;
	updatedAt: Date;
}

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
		return TransactionValidator.validate(this.props);
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

	get color(): TransactionColor {
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
