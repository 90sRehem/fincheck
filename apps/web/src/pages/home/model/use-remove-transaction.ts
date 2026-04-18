import { useMutation } from "@tanstack/react-query";
import type { MutationConfig } from "@/shared/lib/react-query";
import { removeTransaction } from "../api/transactions";

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
