import { apiClient } from "@/shared/api";

type LoginRequest = {
  email: string;
  password: string;
};

type LoginResponse = {
  accessToken: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
};

export async function login({ email, password }: LoginRequest) {
  const response = await apiClient.post<LoginResponse>({
    url: "/api/login",
    body: {
      email,
      password,
    },
  });

  return {
    accessToken: response.data.accessToken,
    userId: response.data.user.id,
  };
}
