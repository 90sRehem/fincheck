import { authClient } from "@/shared/api";

type LoginRequest = {
	email: string;
	password: string;
};

type LoginResponse = {
	token: string;
	user: {
		id: string;
		email: string;
		name: string;
	};
};

export async function login({ email, password }: LoginRequest) {
	const response = await authClient.post<LoginResponse>({
		url: "/api/auth/sign-in/email",
		body: {
			email,
			password,
		},
	});

	return {
		token: response.data.token,
		user: response.data.user,
	};
}
