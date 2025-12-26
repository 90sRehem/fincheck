import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { login } from "../endpoints/login";
import { sessionActions } from "@/pages/session/model/session-store";

export function useLoginMutation() {
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: login,
    meta: {
      errorMessage: "Falha no login",
    },
    onSuccess: (token) => {
      // Salva o token e marca usuário como autenticado
      sessionActions.login({
        token,
null
      });

      // Redireciona para a home
      router.navigate({ to: "/" });
    },
  });

  return {
    login: mutation.mutate,
    isPending: mutation.isPending,
    isError: mutation.isError,
  };
}
