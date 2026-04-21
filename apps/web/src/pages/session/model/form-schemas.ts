import z from "zod";

const MIN_PASSWORD_LENGTH = 8;
const MIN_NAME_LENGTH = 3;

const emailSchema = z.email({
	message: "E-mail inválido.",
});

const passwordSchema = z.string().min(MIN_PASSWORD_LENGTH, {
	message: "Senha deve ter no mínimo 8 caracteres.",
});

const nameSchema = z.string().min(MIN_NAME_LENGTH, {
	message: "Nome deve ter no mínimo 3 caracteres.",
});

export const loginFormSchema = z.object({
	email: emailSchema,
	password: passwordSchema,
});

export const registerFormSchema = z.object({
	name: nameSchema,
	email: emailSchema,
	password: passwordSchema,
});

export type LoginFormData = z.infer<typeof loginFormSchema>;
export type RegisterFormData = z.infer<typeof registerFormSchema>;
