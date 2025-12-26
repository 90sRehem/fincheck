import { useLoginMutation } from "@/shared/api";
import { Button, Form, InputField } from "@fincheck/design-system";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import z from "zod";

const formSchema = z.object({
  email: z.email({
    message: "E-mail inválido.",
  }),
  password: z.string().min(2, {
    message: "Senha deve ter no mínimo 2 caracteres.",
  }),
});

type FormData = z.infer<typeof formSchema>;

export function LoginPage() {
  const form = useForm({
    resolver: zodResolver(formSchema),
  });

  const { login } = useLoginMutation();

  const handleSubmit = (data: FormData) => {
    console.log(data);
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
