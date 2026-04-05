import { Either } from "../types/either";
import { ValidationFieldsError } from "../validators/validation-fields-error";
import { Id } from "../value-objects/id";

export interface EntityProps {
	createdAt: Date;
	updatedAt: Date;
}

export abstract class Entity<T> {
	protected readonly _id: Id;
	protected props: T & EntityProps;

	protected constructor(props: T & EntityProps, id?: string) {
		this._id = Id.create(id);
		this.props = {
			...props,
			createdAt: props.createdAt ?? new Date(),
			updatedAt: props.updatedAt ?? new Date(),
		};
	}

	get id(): Id {
		return this._id;
	}

	get createdAt(): Date {
		return this.props.createdAt;
	}

	get updatedAt(): Date {
		return this.props.updatedAt;
	}

	equals(entity: Entity<T>): boolean {
		if (entity === null || entity === undefined) {
			return false;
		}
		return this._id.equals(entity._id);
	}

	update(props: Partial<T>): void {
		this.props = {
			...this.props,
			...props,
		};
		this.props.updatedAt = new Date();
	}

	toJSON(): object & EntityProps {
		return {
			id: this._id.toString(),
			...this.props,
		};
	}

	abstract validate(): Either<ValidationFieldsError, void>;
}
