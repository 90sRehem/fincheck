import { useMutation } from "@tanstack/react-query";
import { sessionActions } from "@/entities/session";
import { register } from "@/shared/api";

export function useRegisterMutation() {
	const mutation = useMutation({
		mutationFn: register,
		onSuccess: ({ token }) => {
			sessionActions.login({ token });
		},
		meta: {
			successMessage: "Registro feito com sucesso",
			errorMessage: "Falha no registro",
		},
	});

	return {
		register: mutation.mutate,
		isPending: mutation.isPending,
		isError: mutation.isError,
	};
}
