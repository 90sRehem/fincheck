import {
	Button,
	Dialog,
	IconButton,
	InputField,
	Select,
} from "@fincheck/design-system";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { Link, useNavigate } from "@tanstack/react-router";
import { Controller, useForm } from "react-hook-form";
import { NumericFormat } from "react-number-format";
import * as users from "@/entities/users";
import type { CreateTransactionFormData } from "../model/create-transaction-schema";
import { createTransactionSchema } from "../model/create-transaction-schema";
import { useCategoriesList } from "../model/use-categories-list";
import { useCreateTransaction } from "../model/use-create-transaction";
import { useListAccounts } from "../model/use-list-accounts";

const CENTS_PER_UNIT = 100;

export function AddExpense() {
	const navigate = useNavigate();
	const { user } = users.useUser();
	const { categories } = useCategoriesList();
	const { accounts } = useListAccounts();
	const createTransactionMutation = useCreateTransaction();

	const form = useForm<CreateTransactionFormData>({
		resolver: standardSchemaResolver(createTransactionSchema),
		defaultValues: {
			name: "",
			category: "",
			account: "",
			amount: 0,
			date: new Date().toISOString().split("T")[0],
		},
	});

	const handleClose = () => {
		navigate({ to: "/", search: (prev) => prev });
	};

	const handleSubmit = (data: CreateTransactionFormData) => {
		createTransactionMutation.mutate(
			{
				userId: user.id,
				accountId: data.account,
				title: data.name,
				amountCents: data.amount * CENTS_PER_UNIT,
				date: data.date,
				category: data.category,
				type: "expense",
			},
			{
				onSettled: () => {
					handleClose();
				},
			},
		);
	};

	return (
		<Dialog open onOpenChange={(open) => !open && handleClose()}>
			<Dialog.Content showCloseButton={false} className="gap-10">
				<Dialog.Header className="relative flex items-center justify-center">
					<Dialog.Close asChild className="absolute left-0 hover:bg-gray-1">
						<Link to="/" search={(prev) => prev}>
							<IconButton icon="Close" />
						</Link>
					</Dialog.Close>
					<Dialog.Title>Nova Despesa</Dialog.Title>
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
							label="Nome da despesa"
							placeholder="Nome da despesa"
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
											<Select.Value placeholder="Pagar com" />
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
						disabled={createTransactionMutation.isPending}
					>
						{createTransactionMutation.isPending ? "Salvando..." : "Salvar"}
					</Button>
				</form>
			</Dialog.Content>
		</Dialog>
	);
}
