import { apiClient } from "@/shared/api";

type GetUserResponse = {
  id: string;
  email: string;
  name: string;
  password: string;
};

export type GetUserRequest = {
  id: string;
};

export async function getUser({ id }: GetUserRequest) {
  const response = await apiClient.get<GetUserResponse>({
    url: `/api/users/${id}`,
  });

  return {
    id: response.data.id,
    email: response.data.email,
    name: response.data.name,
  };
}
