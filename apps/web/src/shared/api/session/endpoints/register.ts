import { apiClient } from "../../api-client";

type RegisterRequest = {
  email: string;
  password: string;
};

type RegisterResponse = {
  token: string;
};

export async function register({ email, password }: RegisterRequest) {
  const response = await apiClient.post<RegisterResponse>({
    url: "/api/register",
    body: {
      email,
      password,
    },
  });

  return response.data.token;
}
