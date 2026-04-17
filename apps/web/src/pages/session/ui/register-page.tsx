import { Button, Form, InputField } from "@fincheck/design-system";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { Link, useRouter } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import z from "zod";
import { useRegisterMutation } from "../model/use-register";

const MIN_PASSWORD_LENGTH = 8;
const MIN_NAME_LENGTH = 3;

const formSchema = z.object({
	name: z.string().min(MIN_NAME_LENGTH, {
		message: "Nome deve ter no mínimo 3 caracteres.",
	}),
	email: z.email({
		message: "E-mail inválido.",
	}),
	password: z.string().min(MIN_PASSWORD_LENGTH, {
		message: "Senha deve ter no mínimo 8 caracteres.",
	}),
});

type FormData = z.infer<typeof formSchema>;

export function RegisterPage() {
	const form = useForm({
		resolver: standardSchemaResolver(formSchema),
	});

	const router = useRouter();
	const { register } = useRegisterMutation();

	const handleSubmit = (data: FormData) => {
		console.log("handleSubmit register", data);
		register(data, { onSuccess: () => router.navigate({ to: "/" }) });
	};

	return (
		<>
			<div className="flex flex-col gap-2">
				<h2 className="heading-2 color-gray-9 text-center">Crie sua conta</h2>
				<div className="flex flex-row justify-center items-center gap-2">
					<span className="body-normal-regular">Já possui uma conta?</span>

					<Link to="/session/login">
						<span className="button-large text-teal-9 hover:underline">
							Fazer login
						</span>
					</Link>
				</div>
			</div>
			<Form {...form}>
				<form
					onSubmit={form.handleSubmit(handleSubmit)}
					className="flex flex-col items-center p-0 gap-6 w-[311px]"
					noValidate
				>
					<InputField
						label="Nome"
						type="text"
						placeholder="Nome"
						containerClassName="w-full"
						{...form.register("name")}
						error={form.formState.errors.name?.message}
					/>
					<InputField
						label="E-mail"
						type="email"
						placeholder="E-mail"
						containerClassName="w-full"
						{...form.register("email")}
						error={form.formState.errors.email?.message}
					/>
					<InputField
						label="Senha"
						type="password"
						placeholder="Senha"
						containerClassName="w-full"
						{...form.register("password")}
						error={form.formState.errors.password?.message}
					/>
					<div className="flex flex-row justify-center items-center gap-2 w-full">
						<Button
							variant="primary"
							type="submit"
							intent="default"
							className="w-full"
						>
							Entrar
						</Button>{" "}
					</div>
				</form>
			</Form>
		</>
	);
}
