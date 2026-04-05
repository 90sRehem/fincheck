export abstract class WatchedList<T> {
	private initial: T[];
	private current: T[];
	private new: T[];
	private removed: T[];

	constructor() {
		this.initial = [];
		this.current = [];
		this.new = [];
		this.removed = [];
	}

	protected abstract compareItems(a: T, b: T): boolean;

	getItems(): T[] {
		return this.current;
	}

	getNewItems(): T[] {
		return this.new;
	}

	getRemovedItems(): T[] {
		return this.removed;
	}

	add(item: T): void {
		const alreadyRemoved = this.removed.some((r) => this.compareItems(r, item));
		if (alreadyRemoved) {
			this.removed = this.removed.filter((r) => !this.compareItems(r, item));
			this.current.push(item);
			return;
		}

		const alreadyExists = this.current.some((c) => this.compareItems(c, item));
		if (!alreadyExists) {
			this.new.push(item);
			this.current.push(item);
		}
	}

	remove(item: T): void {
		const inInitial = this.initial.some((i) => this.compareItems(i, item));
		const inNew = this.new.some((n) => this.compareItems(n, item));

		if (inNew) {
			this.new = this.new.filter((n) => !this.compareItems(n, item));
			this.current = this.current.filter((c) => !this.compareItems(c, item));
			return;
		}

		if (inInitial) {
			this.removed.push(item);
			this.current = this.current.filter((c) => !this.compareItems(c, item));
		}
	}

	update(items: T[]): void {
		const currentIds = new Set(this.current.map((c) => JSON.stringify(c)));
		const newIds = new Set(items.map((i) => JSON.stringify(i)));

		for (const item of this.current) {
			if (!newIds.has(JSON.stringify(item))) {
				this.removed.push(item);
			}
		}

		for (const item of items) {
			if (!currentIds.has(JSON.stringify(item))) {
				this.new.push(item);
			}
		}

		this.current = items;
	}
}
