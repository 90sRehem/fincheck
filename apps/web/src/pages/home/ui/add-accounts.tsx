import {
	Button,
	Dialog,
	IconButton,
	InputField,
	Select,
} from "@fincheck/design-system";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { Link, useNavigate } from "@tanstack/react-router";
import { Suspense } from "react";
import { Controller, useForm } from "react-hook-form";
import { NumericFormat } from "react-number-format";
import { getColorIcon } from "../lib/get-color-icon";
import {
	type AddAccountFormData,
	addAcountSchema,
} from "../model/add-account-schema";
import { useAddAccount } from "../model/use-add-account";
import { useListAccountTypes } from "../model/use-list-account-types";
import { useListColors } from "../model/use-list-colors";

function AddAccountSkeleton() {
	return (
		<Dialog open>
			<Dialog.Content showCloseButton={false} className="gap-10">
				<Dialog.Header className="relative flex items-center justify-center">
					<Dialog.Close asChild className="absolute left-0 hover:bg-gray-1">
						<Link to="/" search={(prev) => prev}>
							<IconButton icon="Close" />
						</Link>
					</Dialog.Close>
					<Dialog.Title className="heading-4">Nova Conta</Dialog.Title>
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
							<div className="h-4 w-24 bg-gray-3 animate-pulse rounded" />
							<div className="h-12 w-full bg-gray-3 animate-pulse rounded-lg" />
						</div>

						<div className="flex flex-col gap-2">
							<div className="h-12 w-full bg-gray-3 animate-pulse rounded-lg" />
						</div>

						<div className="flex flex-col gap-2">
							<div className="h-12 w-full bg-gray-3 animate-pulse rounded-lg" />
						</div>
					</div>

					<div className="h-13.5 w-full bg-gray-3 animate-pulse rounded-2xl" />
				</div>
			</Dialog.Content>
		</Dialog>
	);
}

function AddAccountForm() {
	const navigate = useNavigate();
	const { accountTypes } = useListAccountTypes();
	const { colors } = useListColors();
	const { addAccount, isPending } = useAddAccount();

	const form = useForm<AddAccountFormData>({
		resolver: standardSchemaResolver(addAcountSchema),
		defaultValues: {
			name: "",
			type: "",
			color: "",
			amount: 0,
		},
	});

	const handleClose = () => {
		navigate({ to: "/", search: (prev) => prev });
	};

	const handleSubmit = (data: AddAccountFormData) => {
		addAccount({
			name: data.name,
			type: data.type,
			color: data.color,
			initialBalance: data.amount,
		});
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
					<Dialog.Title className="heading-4">Nova Conta</Dialog.Title>
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
							label="Nome da conta"
							placeholder="Nome da conta"
							className="w-full"
							error={form.formState.errors.name?.message}
						/>

						<Controller
							name="type"
							control={form.control}
							render={({ field }) => (
								<div className="flex flex-col gap-1">
									<Select value={field.value} onValueChange={field.onChange}>
										<Select.Trigger>
											<Select.Value placeholder="Tipo" />
										</Select.Trigger>
										<Select.Content>
											<Select.Group>
												{accountTypes.map((accountType) => (
													<Select.Item
														key={accountType.id}
														value={accountType.id}
													>
														{accountType.name}
													</Select.Item>
												))}
											</Select.Group>
										</Select.Content>
									</Select>
									{form.formState.errors.type && (
										<span className="text-xs text-red-500">
											{form.formState.errors.type.message}
										</span>
									)}
								</div>
							)}
						/>

						<Controller
							name="color"
							control={form.control}
							render={({ field }) => (
								<div className="flex flex-col gap-1">
									<Select value={field.value} onValueChange={field.onChange}>
										<Select.Trigger>
											<Select.Value placeholder="Cor" />
										</Select.Trigger>
										<Select.Content>
											<Select.Group>
												{colors.map((color) => {
													const Icon = getColorIcon(color.id);
													return (
														<Select.Item key={color.id} value={color.id}>
															<div className="flex items-center gap-2">
																{Icon && <Icon className="w-6 h-6" />}
																<span>{color.name}</span>
															</div>
														</Select.Item>
													);
												})}
											</Select.Group>
										</Select.Content>
									</Select>
									{form.formState.errors.color && (
										<span className="text-xs text-red-500">
											{form.formState.errors.color.message}
										</span>
									)}
								</div>
							)}
						/>
					</div>

					<Button
						type="submit"
						variant="primary"
						className="w-full h-13.5"
						disabled={isPending}
					>
						{isPending ? "Salvando..." : "Salvar"}
					</Button>
				</form>
			</Dialog.Content>
		</Dialog>
	);
}

export function AddAccount() {
	return (
		<Suspense fallback={<AddAccountSkeleton />}>
			<AddAccountForm />
		</Suspense>
	);
}
