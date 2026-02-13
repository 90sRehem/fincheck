import { UserAvatar } from "@/entities/users";
import { Logo } from "@/shared/ui";

export function Header() {
  return (
    <header className="flex flex-row justify-between items-center py-2 px-0 gap-2 w-full h-16">
      <Logo className="text-teal-9 size-30" />
      <UserAvatar />
    </header>
  );
}
