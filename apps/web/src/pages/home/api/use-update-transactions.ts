import type { MutationConfig } from "@/shared/lib/react-query";
import { updateTransaction, transactionsQueryFactory } from "./transactions";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { UpdateTransactionRequest } from "./transactions";

type UseUpdateTransactionOptions = MutationConfig<typeof updateTransaction>;
type UseUpdateTransactionConfig = Pick<
  UseUpdateTransactionOptions,
  "onSuccess" | "onError" | "onSettled"
>;

export function useUpdateTransaction(config: UseUpdateTransactionConfig = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateTransactionRequest) => updateTransaction(data),
    meta: {
      successMessage: "Transação atualizada com sucesso",
      errorMessage: "Falha ao atualizar transação",
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: transactionsQueryFactory.all,
      });
    },
    ...config,
  });
}
