import { createStore } from "@/shared/lib/core";
import { userService, type User } from "@/shared/lib/user";

type UserState = {
	user: User | null;
};

const initialState: UserState = {
	user: null,
};

function getInitialState(): UserState {
	try {
		const user = userService.getUser();

		if (user) {
			return { user };
		}
	} catch (error) {
		console.error("Error loading users from storage:", error);
		userService.removeUser();
	}

	return initialState;
}

export const userStore = createStore<UserState>(getInitialState());

export const userActions = {
	addUser({ user }: { user: User }) {
		userStore.setState({ user });
		userService.setUser(user);
	},
	removeUser() {
		userStore.setState(initialState);
		userService.removeUser();
	},
	updateUser({ user }: { user: Partial<User> }) {
		const updatedUser = userService.updateUser(user);
		if (updatedUser) {
			userStore.setState({ user: updatedUser });
		}
	},
};
