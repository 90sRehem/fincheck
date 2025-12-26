import { Logo } from "@/shared/ui";
import { Avatar, Card, IconButton, Icons } from "@fincheck/design-system";
import { useState } from "react";

export function HomePage() {
  const [showValue, setShowValue] = useState<"show" | "hide">("hide");

  return (
    <main className="h-screen w-screen bg-white p-4">
      <div className="flex flex-col gap-2">
        <header className="flex flex-row justify-between items-center py-2 px-0 gap-2 w-full h-16">
          <Logo className="text-teal-9 size-30" />
          <Avatar className="size-12">
            <Avatar.Image src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80" />
            <Avatar.Fallback>UI</Avatar.Fallback>
          </Avatar>
        </header>
        <article className="flex flex-col justify-center items-start px-4 py-8 gap-10 w-full min-h-0 bg-teal-9 rounded-2xl">
          {/* balance */}
          <div className="flex flex-col items-start p-0 h-[72px]">
            {/* title */}
            <span className="body-normal-regular text-white">Saldo total</span>
            {/* value */}
            <div className="flex flex-row items-center p-0 gap-2 h-12">
              <h1
                className="heading-1 text-white transition-all duration-300 data-[show-value=hide]:blur-sm"
                data-show-value={showValue}
              >
                R$ 100,00
              </h1>
              <IconButton
                icon={showValue === "show" ? "EyeOpen" : "EyeClosed"}
                className="text-white"
                onClick={() =>
                  setShowValue((prev) => (prev === "show" ? "hide" : "show"))
                }
              />
            </div>
          </div>
          {/* accounts */}
          <div className="flex flex-col justify-center items-start gap-4 w-full">
            <h4 className="heading-4 text-white">Minhas Contas</h4>

            {/* card container */}
            <div className="flex flex-row items-start gap-4 w-full h-full overflow-x-scroll scrollbar-hide">
              <Card size="small" />

              <Card />
            </div>
          </div>
        </article>
      </div>
    </main>
  );
}
