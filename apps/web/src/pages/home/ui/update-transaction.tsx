import { useUser } from "@/entities/users";
import {
  Button,
  Dialog,
  IconButton,
  Icons,
  InputField,
  Select,
} from "@fincheck/design-system";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { Controller, useForm } from "react-hook-form";
import { NumericFormat } from "react-number-format";
import { Suspense } from "react";
import { type CreateTransactionFormData } from "../model/create-transaction-schema";
import { useCategoriesList } from "../model/use-categories-list";
import { useListAccounts } from "../model/use-list-accounts";
import { useUpdateTransaction } from "../api/use-update-transactions";
import {
  updateTransactionSchema,
  type UpdateTransactionFormData,
} from "../model/update-transaction-schema";
import { useTransaction } from "../api/use-transaction";
import { useRemoveTransaction } from "../api/use-remove-transaction";

function UpdateTransactionSkeleton() {
  return (
    <Dialog open>
      <Dialog.Content showCloseButton={false} className="gap-10">
        <Dialog.Header className="relative flex items-center justify-center">
          <div className="absolute left-0">
            <div className="size-10 bg-gray-3 animate-pulse rounded-full" />
          </div>
          <div className="h-6 w-24 bg-gray-3 animate-pulse rounded" />
          <div className="absolute right-0">
            <div className="size-10 bg-gray-3 animate-pulse rounded-full" />
          </div>
        </Dialog.Header>
        <div className="flex flex-col gap-6">
          <div className="flex gap-4 items-center justify-center">
            <div className="flex flex-col justify-center items-center p-0 gap-2">
              <div className="flex gap-2 items-center justify-center">
                <span className="body-large-regular text-gray-6 shrink-0">
                  R$
                </span>
                <div className="h-12 w-16 bg-gray-3 animate-pulse rounded" />
              </div>
              <span className="input-label text-gray-6">Saldo atual</span>
            </div>
          </div>

          <div className="w-full flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <div className="h-4 w-32 bg-gray-3 animate-pulse rounded" />
              <div className="h-12 w-full bg-gray-3 animate-pulse rounded-lg" />
            </div>

            <div className="flex flex-col gap-2">
              <div className="h-12 w-full bg-gray-3 animate-pulse rounded-lg" />
            </div>

            <div className="flex flex-col gap-2">
              <div className="h-12 w-full bg-gray-3 animate-pulse rounded-lg" />
            </div>

            <div className="flex flex-col gap-2">
              <div className="h-4 w-16 bg-gray-3 animate-pulse rounded" />
              <div className="h-12 w-full bg-gray-3 animate-pulse rounded-lg" />
            </div>
          </div>

          <div className="h-13.5 w-full bg-gray-3 animate-pulse rounded-2xl" />
        </div>
      </Dialog.Content>
    </Dialog>
  );
}

function UpdateTransactionForm() {
  const navigate = useNavigate();
  const params = useParams({
    from: "/$id",
    select: (params) => params,
  });

  const { user } = useUser();
  const { categories } = useCategoriesList();
  const { accounts } = useListAccounts({
    userId: user.id,
  });
  const { transaction } = useTransaction({ id: params.id });
  const updateTransactionMutation = useUpdateTransaction();

  const form = useForm<UpdateTransactionFormData>({
    resolver: zodResolver(updateTransactionSchema),
    defaultValues: {
      name: transaction?.title ?? "",
      category: transaction?.category ?? "",
      account: transaction?.accountId ?? "",
      amount: transaction?.amountCents ?? 0,
      date: transaction?.date ?? new Date().toISOString().split("T")[0],
    },
  });

  const handleClose = () => {
    navigate({ to: "/", search: (prev) => prev });
  };

  const handleSubmit = (data: CreateTransactionFormData) => {
    updateTransactionMutation.mutate(
      {
        id: params.id,
        userId: user.id,
        accountId: data.account,
        title: data.name,
        amountCents: data.amount * 100,
        type: "revenue",
        category: data.category,
        date: data.date,
      },
      {
        onSettled: () => {
          handleClose();
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
            <Link to="/" search={(prev) => prev}>
              <IconButton icon="Close" />
            </Link>
          </Dialog.Close>
          <Dialog.Title>{title}</Dialog.Title>

          <Link
            to="/remove/$id"
            search={(prev) => prev}
            params={{
              id: params.id,
            }}
            className="absolute right-0"
          >
            <Button
              intent="destructive"
              variant="tertiary"
              className="text-red-9 hover:text-red-6"
              type="button"
            >
              <Icons.Delete className="size-6" />
            </Button>
          </Link>
        </Dialog.Header>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          noValidate
          className="flex flex-col gap-6"
        >
          <div className="flex gap-4 items-center justify-center">
            <Controller
              name="amount"
              control={form.control}
              render={({ field }) => {
                const displayValue = field.value?.toString();
                const inputWidth = Math.max(2, displayValue.length);

                return (
                  <div className="flex flex-col justify-center items-center p-0 gap-2">
                    <div className="flex gap-2 items-center justify-center">
                      <span className="body-large-regular text-gray-6 shrink-0">
                        R$
                      </span>
                      <NumericFormat
                        thousandSeparator="."
                        decimalSeparator=","
                        value={field.value}
                        onValueChange={(values) => {
                          field.onChange(values.floatValue || 0);
                        }}
                        className="heading-1 text-center flex items-center shrink-0"
                        style={{ width: `${inputWidth}ch` }}
                      />
                    </div>
                    <span className="input-label text-gray-6">Saldo atual</span>
                    {form.formState.errors.amount && (
                      <span className="text-xs text-red-500">
                        {form.formState.errors.amount.message}
                      </span>
                    )}
                  </div>
                );
              }}
            />
          </div>

          <div className="w-full flex flex-col gap-4">
            <InputField
              {...form.register("name")}
              label="Nome da receita"
              placeholder="Nome da receita"
              className="w-full"
              error={form.formState.errors.name?.message}
            />

            <Controller
              name="category"
              control={form.control}
              render={({ field }) => (
                <div className="flex flex-col gap-1">
                  <Select value={field.value} onValueChange={field.onChange}>
                    <Select.Trigger>
                      <Select.Value placeholder="Categoria" />
                    </Select.Trigger>
                    <Select.Content>
                      <Select.Group>
                        {categories.map((category) => (
                          <Select.Item key={category.id} value={category.id}>
                            {category.name}
                          </Select.Item>
                        ))}
                      </Select.Group>
                    </Select.Content>
                  </Select>
                  {form.formState.errors.category && (
                    <span className="text-xs text-red-500">
                      {form.formState.errors.category.message}
                    </span>
                  )}
                </div>
              )}
            />

            <Controller
              name="account"
              control={form.control}
              render={({ field }) => (
                <div className="flex flex-col gap-1">
                  <Select value={field.value} onValueChange={field.onChange}>
                    <Select.Trigger>
                      <Select.Value placeholder="Receber na conta" />
                    </Select.Trigger>
                    <Select.Content>
                      <Select.Group>
                        {accounts.map((account) => (
                          <Select.Item key={account.id} value={account.id}>
                            {account.name}
                          </Select.Item>
                        ))}
                      </Select.Group>
                    </Select.Content>
                  </Select>
                  {form.formState.errors.account && (
                    <span className="text-xs text-red-500">
                      {form.formState.errors.account.message}
                    </span>
                  )}
                </div>
              )}
            />

            <InputField
              {...form.register("date")}
              type="date"
              label="Data"
              className="w-full"
              error={form.formState.errors.date?.message}
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full h-13.5"
            disabled={updateTransactionMutation.isPending}
          >
            {updateTransactionMutation.isPending ? "Salvando..." : "Salvar"}
          </Button>
        </form>
      </Dialog.Content>
    </Dialog>
  );
}

export function UpdateTransaction() {
  return (
    <Suspense fallback={<UpdateTransactionSkeleton />}>
      <UpdateTransactionForm />
    </Suspense>
  );
}
