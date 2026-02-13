import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { createAccount } from "../api/accounts";

export function useAddAccount() {
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: createAccount,
    onSuccess: () => {
      navigate({ to: "/" });
    },
    meta: {
      successMessage: "Conta criada com sucesso",
      errorMessage: "Falha ao criar conta",
    },
  });

  return {
    addAccount: mutation.mutate,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  };
}
