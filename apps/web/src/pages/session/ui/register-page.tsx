import { InputField, Button } from "@fincheck/design-system";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "@tanstack/react-router";
import { Form, useForm } from "react-hook-form";
import z from "zod";

const formSchema = z.object({
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
});

export function RegisterPage() {
  const form = useForm({
    resolver: zodResolver(formSchema),
  });

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
        <form className="flex flex-col items-center p-0 gap-6 w-[311px]">
          <InputField
            label="Nome"
            type="text"
            placeholder="Nome"
            containerClassName="w-full"
          />
          <InputField
            label="E-mail"
            type="email"
            placeholder="E-mail"
            containerClassName="w-full"
          />
          <InputField
            label="Senha"
            type="password"
            placeholder="Senha"
            containerClassName="w-full"
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
