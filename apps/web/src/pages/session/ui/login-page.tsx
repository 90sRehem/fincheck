import { Button, Form, InputField } from "@fincheck/design-system";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { Link } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import type { LoginFormData } from "../model/form-schemas";
import { loginFormSchema } from "../model/form-schemas";
import { useLogin } from "../model/use-login";

export function LoginPage() {
	const form = useForm({
		resolver: standardSchemaResolver(loginFormSchema),
	});

	const { login } = useLogin();

	const handleSubmit = (data: LoginFormData) => {
		console.log("handleSubmit login", data);
		login(data);
	};

	return (
		<>
			<div className="flex flex-col gap-2">
				<h2 className="heading-2 color-gray-9 text-center">
					Entre em sua conta
				</h2>
				<div className="flex flex-row justify-center items-center gap-2">
					<span className="body-normal-regular">Novo por aqui?</span>

					<Link to="/session/register">
						<span className="button-large text-teal-9 hover:underline">
							Crie uma conta
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
						label="E-mail"
						type="email"
						placeholder="E-mail"
						{...form.register("email")}
						error={form.formState.errors.email?.message}
					/>
					<InputField
						label="Senha"
						type="password"
						placeholder="Senha"
						{...form.register("password")}
						error={form.formState.errors.password?.message}
					/>
					<div className="flex flex-row justify-center items-center gap-2 w-full">
						<Button
							variant="primary"
							type="submit"
							intent="default"
							className="w-full h-13.5"
						>
							Entrar
						</Button>{" "}
					</div>
				</form>
			</Form>
		</>
	);
}
