import { apiClient } from "../api-client";

type RegisterRequest = {
	name: string;
	email: string;
	password: string;
	rememberMe?: boolean;
	image?: string;
};

type RegisterUser = {
	id: string;
	name: string;
	email: string;
	image: string | null;
	emailVerified: boolean;
};

type RegisterResponse = {
	token: string;
	user: RegisterUser;
};

export async function register({
	email,
	password,
	name,
	image,
	rememberMe = false,
}: RegisterRequest) {
	const response = await apiClient.post<RegisterResponse>({
		url: "/api/auth/sign-up/email",
		body: {
			email,
			password,
			name,
			image,
			rememberMe,
		},
	});

	return response.data;
}
