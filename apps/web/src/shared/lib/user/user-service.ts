import { userStorage } from "@/shared/lib/storage";

export type User = {
	id: string;
	email: string;
};

export interface UserServiceConfig {
	onUserChanged?: (user: User | null) => void;
	storage?: Storage;
}

export class UserService {
	private readonly userStorage = userStorage;

	constructor(config: UserServiceConfig = {}) {
		if (config.onUserChanged) {
			this.configure(config);
		}
	}

	getUser(): User | null {
		return this.userStorage.getUser();
	}

	setUser(user: User): boolean {
		return this.userStorage.setUser(user);
	}

	removeUser(): boolean {
		return this.userStorage.removeUser();
	}

	updateUser(userUpdate: Partial<User>): User | null {
		return this.userStorage.updateUser(userUpdate);
	}

	hasUser(): boolean {
		return this.userStorage.hasUser();
	}

	configure(config: UserServiceConfig): void {
		this.userStorage.configure({
			onUserChanged: config.onUserChanged,
			storage: config.storage,
		});
	}
}

export const userService = new UserService();
