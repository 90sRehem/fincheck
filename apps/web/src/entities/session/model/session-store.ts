import { createStore } from "@/shared/lib/core";
import { queryClient } from "@/shared/lib/react-query";
import {
	configureTokenServiceWithLogout,
	tokenService,
} from "@/shared/lib/token";

type Session = {
	token: string | null;
	isAuthenticated: boolean;
};

const initialState: Session = {
	token: null,
	isAuthenticated: false,
};

export const sessionActions = {
	login({ token }: { token: string }) {
		sessionStore.setState({ token, isAuthenticated: true });
		tokenService.setToken(token);
	},
	logout() {
		sessionStore.setState(initialState);
		tokenService.removeToken();
		void queryClient.invalidateQueries({ queryKey: ["user", "me"] });
		globalThis.location.href = "/session";
	},
	getToken() {
		return tokenService.getToken();
	},
};

export const sessionStore = createStore<Session>(getInitialState());

export const userIsAuthenticated = () => {
	return sessionStore.getState().token !== null;
};

function getInitialState(): Session {
	try {
		const token = tokenService.getToken();

		if (token) {
			return { token, isAuthenticated: true };
		}
	} catch (error) {
		console.error("Error loading token from storage:", error);
		tokenService.removeToken();
	}

	return initialState;
}

configureTokenServiceWithLogout(() => {
	console.warn("🚫 Token expirado, fazendo logout...");
	sessionActions.logout();
});
