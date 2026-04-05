import { ValueObject } from "./value-object";

export class Id extends ValueObject<string> {
	private constructor(props: string) {
		super(props);
	}

	static create(props?: string): Id {
		const value = props ?? crypto.randomUUID();
		return new Id(value);
	}

	static fromString(value: string): Id {
		if (!value || value.trim().length === 0) {
			throw new Error("Id cannot be empty");
		}
		return new Id(value);
	}

	toString(): string {
		return this.props;
	}
}
