import { apiClient } from "../../api-client";

type LoginRequest = {
  email: string;
  password: string;
};

type User = {
  id: string;
  email: string;
};

type LoginResponse = {
  accessToken: string;
  user: User;
};

export async function login({ email, password }: LoginRequest) {
  const response = await apiClient.post<LoginResponse>({
    url: "/api/login",
    body: {
      email,
      password,
    },
  });

  return response.data;
}
