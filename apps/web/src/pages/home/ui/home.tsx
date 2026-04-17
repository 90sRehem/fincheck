import { Fab, Icons } from "@fincheck/design-system";
import { Link, Outlet } from "@tanstack/react-router";
import { Balance } from "@/entities/balance";
import { AccountsList } from "./acounts-list";
import { Header } from "./header";
import { TransactionsList } from "./transactions-list";

export function Home() {
	return (
		<main className="h-screen w-screen bg-white p-4 overflow-y-hidden">
			<div className="flex flex-col gap-2 h-full">
				<Header />
				<div className="flex flex-col gap-8 flex-1 min-h-0 2xl:flex-row">
					<article className="flex flex-col items-start px-4 py-8 gap-10 w-full 2xl:min-h-0 bg-teal-9 rounded-2xl 2xl:flex-1 2xl:justify-between overflow-y-auto">
						<Balance />
						<AccountsList />
					</article>
					<article className="flex flex-col w-full flex-1 p-6 rounded-2xl bg-gray-0 min-h-0 overflow-hidden">
						<TransactionsList />
					</article>
				</div>
			</div>
			<Fab className="fixed bottom-6 right-6">
				<Fab.Trigger className="flex items-center justify-center group bg-teal-9 size-12 text-white rounded-full">
					<Icons.Plus className="size-6 transition-transform duration-300 ease-in-out group-data-[state=open]:rotate-45" />
				</Fab.Trigger>
				<Fab.Content
					side="top"
					align="end"
					sideOffset={16}
					className="bg-white flex flex-col justify-end items-start p-2 rounded-2xl"
				>
					<Link to="/add-expense" className="w-full" search={(prev) => prev}>
						<Fab.Item>
							<Fab.ItemIcon icon="Expense" />
							<Fab.ItemText>Nova Despesa</Fab.ItemText>
						</Fab.Item>
					</Link>
					<Link to="/add-revenue" className="w-full" search={(prev) => prev}>
						<Fab.Item>
							<Fab.ItemIcon icon="Revenue" />
							<Fab.ItemText>Nova Receita</Fab.ItemText>
						</Fab.Item>
					</Link>
					<Link to="/add-account" className="w-full" search={(prev) => prev}>
						<Fab.Item>
							<Fab.ItemIcon icon="BankAccounts" />
							<Fab.ItemText>Nova Conta</Fab.ItemText>
						</Fab.Item>
					</Link>
				</Fab.Content>
			</Fab>
			<Outlet />
		</main>
	);
}
