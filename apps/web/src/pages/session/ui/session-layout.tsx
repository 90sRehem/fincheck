import { Logo } from "@/shared/ui";
import type { PropsWithChildren } from "react";

export function SessionLayout(props: Readonly<PropsWithChildren>) {
  return (
    <div className="bg-gray-0 h-screen w-screen flex flex-col justify-center items-center p-0 gap-12 ">
      <Logo />
      <div className="flex flex-col w-full justify-center items-center p-0 gap-12">
        {props.children}
      </div>
    </div>
  );
}
