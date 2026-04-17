import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { sessionActions } from "@/entities/session";
import { login } from "@/shared/api";

export function useLogin() {
	const router = useRouter();

	const mutation = useMutation({
		mutationFn: login,
		onSuccess: ({ token }) => {
			sessionActions.login({ token });
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
