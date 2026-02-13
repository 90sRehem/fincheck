import { z } from "zod";

export const createTransactionSchema = z.object({
  name: z.string().min(2, {
    message: "Nome deve ter no mínimo 2 caracteres.",
  }),
  category: z.string().min(1, {
    message: "Selecione uma categoria.",
  }),
  account: z.string().min(1, {
    message: "Selecione uma conta.",
  }),
  amount: z
    .number({
      error: "Valor é obrigatório.",
    })
    .min(0, {
      message: "Valor deve ser maior ou igual a 0.",
    }),
  date: z.string().min(1, {
    message: "Selecione uma data.",
  }),
});

export type CreateTransactionFormData = z.infer<typeof createTransactionSchema>;
