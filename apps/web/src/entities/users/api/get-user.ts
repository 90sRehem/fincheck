import { apiClient } from "@/shared/api";

type GetSessionResponse = {
	session: {
		id: string;
		userId: string;
		expiresAt: string;
	};
	user: {
		id: string;
		name: string;
		email: string;
		image: string | null;
		emailVerified: boolean;
	};
};

export async function getUser() {
	const response = await apiClient.get<GetSessionResponse>({
		url: "/api/auth/get-session",
	});

	return {
		id: response.data.user.id,
		name: response.data.user.name,
		email: response.data.user.email,
		image: response.data.user.image,
		emailVerified: response.data.user.emailVerified,
	};
}
