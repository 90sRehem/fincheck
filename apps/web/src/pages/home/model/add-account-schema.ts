import { z } from "zod";

export const addAcountSchema = z.object({
	name: z.string().min(2, {
		message: "Nome deve ter no mínimo 2 caracteres.",
	}),
	accountTypeId: z.string().min(1, {
		message: "Selecione um tipo.",
	}),
	colorId: z.string().min(1, {
		message: "Selecione uma cor.",
	}),
	initialBalance: z
		.number({
			error: "Valor é obrigatório.",
		})
		.min(0, {
			message: "Valor deve ser maior ou igual a 0.",
		}),
});

export type AddAccountFormData = z.infer<typeof addAcountSchema>;
