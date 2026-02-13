import { Button, Dialog, IconButton, Icons } from "@fincheck/design-system";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { Suspense } from "react";

import { useTransaction } from "../api/use-transaction";
import { useRemoveTransaction } from "../api/use-remove-transaction";
import { useUser } from "@/entities/users";
import { useQueryClient } from "@tanstack/react-query";
import { transactionsQueryFactory } from "../api/transactions";

function RemoveTransactionSkeleton() {
  return (
    <Dialog open>
      <Dialog.Content showCloseButton={false} className="gap-10">
        <Dialog.Header className="relative flex items-center justify-center">
          <div className="absolute left-0">
            <div className="size-10 bg-gray-3 animate-pulse rounded-full" />
          </div>
          <div className="h-6 w-20 bg-gray-3 animate-pulse rounded" />
        </Dialog.Header>
        <div className="flex flex-col gap-10">
          <div className="flex flex-col items-center justify-center gap-6">
            <div className="flex items-center justify-center size-14 bg-gray-3 animate-pulse rounded-full" />
            <div className="flex flex-col gap-2 items-center">
              <div className="h-5 w-48 bg-gray-3 animate-pulse rounded" />
              <div className="h-5 w-40 bg-gray-3 animate-pulse rounded" />
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <div className="h-13.5 w-full bg-gray-3 animate-pulse rounded-2xl" />
            <div className="h-13.5 w-full bg-gray-3 animate-pulse rounded-2xl" />
          </div>
        </div>
      </Dialog.Content>
    </Dialog>
  );
}

function RemoveTransactionForm() {
  const navigate = useNavigate();
  const params = useParams({
    from: "/remove/$id",
  });
  const queryClient = useQueryClient();
  const { user } = useUser();
  const { transaction } = useTransaction({ id: params.id });

  const handleClose = () => {
    navigate({
      to: "/",
      search: (prev) => prev,
    });
  };

  const removeTransactionMutation = useRemoveTransaction();

  const handleRemove = () => {
    removeTransactionMutation.mutate(
      {
        transactionId: params.id,
        userId: user.id,
      },
      {
        onSuccess: async () => {
          handleClose();
          await queryClient.invalidateQueries({
            queryKey: [...transactionsQueryFactory.all, "list"],
          });
        },
      },
    );
  };

  const title = transaction.type === "expense" ? "Despesa" : "Receita";

  return (
    <Dialog open onOpenChange={(open) => !open && handleClose()}>
      <Dialog.Content showCloseButton={false} className="gap-10">
        <Dialog.Header className="relative flex items-center justify-center">
          <Dialog.Close asChild className="absolute left-0 hover:bg-gray-1">
            <Link to="/$id" params={{ id: params.id }} search={(prev) => prev}>
              <IconButton icon="Close" />
            </Link>
          </Dialog.Close>
          <Dialog.Title>Excluir</Dialog.Title>
        </Dialog.Header>
        <div className="flex flex-col gap-10">
          <div className="flex flex-col items-center justify-center gap-6">
            <div className="flex items-center justify-center size-14 bg-red-0 rounded-full">
              <Icons.Delete className="size-6 text-red-9" />
            </div>
            <span className="body-normal-bold text-center">
              Você tem certeza que deseja <br /> excluir esta{" "}
              {title.toLowerCase()}?
            </span>
          </div>
          <div className="flex flex-col gap-4">
            <Button
              type="button"
              intent="destructive"
              variant="primary"
              className="w-full h-13.5"
              onClick={handleRemove}
            >
              Sim desejo excluir
            </Button>
            <Button
              type="button"
              intent="default"
              variant="secondary"
              className="w-full h-13.5"
              onClick={handleClose}
            >
              Cancelar
            </Button>
          </div>
        </div>
      </Dialog.Content>
    </Dialog>
  );
}

export function RemoveTransaction() {
  return (
    <Suspense fallback={<RemoveTransactionSkeleton />}>
      <RemoveTransactionForm />
    </Suspense>
  );
}
