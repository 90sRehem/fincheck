import { register } from "@/shared/api";
import { useMutation } from "@tanstack/react-query";

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
