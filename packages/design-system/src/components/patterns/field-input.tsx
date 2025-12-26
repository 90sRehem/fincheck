import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function FieldInput() {
  return (
    <div className="w-full max-w-md">
      <Field className="bg-white w-[329px] h-[52px] flex flex-row items-center px-0 py-3">
        <FieldLabel htmlFor="username">Username</FieldLabel>
        <Input id="username" type="text" placeholder="Max Leiter" />
        <FieldDescription>
          Choose a unique username for your account.
        </FieldDescription>
      </Field>
      <Field>
        <FieldLabel htmlFor="password">Password</FieldLabel>
        <FieldDescription>Must be at least 8 characters long.</FieldDescription>
        <Input id="password" type="password" placeholder="••••••••" />
      </Field>
    </div>
  );
}
