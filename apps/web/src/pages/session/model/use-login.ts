import { login } from "@/shared/api";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { sessionActions } from "@/entities/session";
import { userActions } from "@/entities/users";

export function useLogin() {
	const router = useRouter();

	const mutation = useMutation({
		mutationFn: login,
		onSuccess: ({ accessToken, userId }) => {
			console.log("login success", { accessToken, userId });
			sessionActions.login({ token: accessToken });
			userActions.addUser({ user: { id: userId, email: "", name: "" } });

			router.navigate({ to: "/" });
		},
		meta: {
			errorMessage: "Falha no login",
		},
	});

	return {
		login: mutation.mutate,
		isPending: mutation.isPending,
		isError: mutation.isError,
	};
}
