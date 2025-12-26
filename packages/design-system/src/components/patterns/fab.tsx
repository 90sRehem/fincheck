import { DropdownMenu, Icons } from "../ui";
import { IconButton } from "./icon-button";

export function Fab() {
  return (
    <div className="fixed bottom-6 right-6">
      <DropdownMenu>
        <DropdownMenu.Trigger asChild>
          <IconButton
            icon="Plus"
            className="data-[state=open]:rotate-45 transition-all duration-300 ease-in-out"
          />
        </DropdownMenu.Trigger>
        <DropdownMenu.Content
          side="top"
          align="end"
          sideOffset={16}
          className="bg-white flex flex-col justify-end items-start p-2 rounded-2xl"
        >
          <FabItem>
            <FabItemIcon icon="Expense" />
            <FabItemText>Nova Despesa</FabItemText>
          </FabItem>
          <FabItem>
            <FabItemIcon icon="Revenue" />
            <FabItemText>Nova Receita</FabItemText>
          </FabItem>
          <FabItem>
            <FabItemIcon icon="BankAccounts" />
            <FabItemText>Nova Conta</FabItemText>
          </FabItem>
        </DropdownMenu.Content>
      </DropdownMenu>
    </div>
  );
}

function FabItem({ children }: { children: React.ReactNode }) {
  return (
    <DropdownMenu.Item className="flex flex-row justify-center items-center p-2 gap-2 w-full h-16 bg-white rounded-2xl">
      {children}
    </DropdownMenu.Item>
  );
}

function FabItemText({ children }: { children: React.ReactNode }) {
  return <span className="body-small-regular text-gray-8">{children}</span>;
}

function FabItemIcon({ icon }: { icon: keyof typeof Icons }) {
  const IconComponent = Icons[icon];
  return <IconComponent />;
}
