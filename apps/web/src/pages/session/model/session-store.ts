import { createStore } from "@/shared/lib/core";

type User = {
  id: string;
  email: string;
};

type SessionState = {
  token: string | null;
  user: User | null;
};

const TOKEN_STORAGE_KEY = "fincheck:token";
const USER_STORAGE_KEY = "fincheck:user";

const initialState: SessionState = {
  token: null,
  user: null,
};

function getInitialState(): SessionState {
  try {
    const token = sessionStorage.getItem(TOKEN_STORAGE_KEY);
    const user = JSON.parse(sessionStorage.getItem(USER_STORAGE_KEY) || "null");

    if (token) {
      return { token, user };
    }
  } catch (error) {
    console.error("Error loading token from storage:", error);
    sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    sessionStorage.removeItem(USER_STORAGE_KEY);
  }

  return initialState;
}

export const sessionStore = createStore<SessionState>(getInitialState());

export const userIsAuthenticated = () => {
  return sessionStore.getState().token !== null;
};

export const sessionActions = {
  login({ token, user }: { token: string; user: User }) {
    sessionStore.setState({ token, user });
    sessionStorage.setItem(TOKEN_STORAGE_KEY, token);
    sessionStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  },
  logout() {
    sessionStore.setState(initialState);
    sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    sessionStorage.removeItem(USER_STORAGE_KEY);
  },
};
