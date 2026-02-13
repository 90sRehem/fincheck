import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createTransaction,
  transactionsQueryFactory,
  type CreateTransactionRequest,
} from "../api/transactions";
import type { MutationConfig } from "@/shared/lib/react-query";

type UseCreateTransactionOptions = MutationConfig<typeof createTransaction>;
type UseCreateTransactionConfig = Pick<
  UseCreateTransactionOptions,
  "onSuccess" | "onError" | "onSettled"
>;

export function useCreateTransaction(config: UseCreateTransactionConfig = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTransactionRequest) => createTransaction(data),
    meta: {
      successMessage: "Receita criada com sucesso",
      errorMessage: "Falha ao criar receita",
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: transactionsQueryFactory.all,
      });
    },
    ...config,
  });
}
