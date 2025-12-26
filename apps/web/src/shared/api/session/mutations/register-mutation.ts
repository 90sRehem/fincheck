import { useMutation } from "@tanstack/react-query";
import { register } from "../endpoints/register";

export function useRegisterMutation() {
  const mutation = useMutation({
    mutationFn: register,
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
