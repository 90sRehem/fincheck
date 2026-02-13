import type { MutationConfig } from "@/shared/lib/react-query";
import { removeTransaction } from "./transactions";
import { useMutation } from "@tanstack/react-query";

type UseRemoveTransactionOptions = MutationConfig<typeof removeTransaction>;
type UseRemoveTransactionConfig = Pick<
  UseRemoveTransactionOptions,
  "onSuccess" | "onError" | "onSettled"
>;

export function useRemoveTransaction(config: UseRemoveTransactionConfig = {}) {
  return useMutation({
    mutationFn: removeTransaction,
    meta: {
      successMessage: "Transação removida com sucesso",
      errorMessage: "Falha ao remover transação",
    },
    ...config,
  });
}
