import { NotFound } from "@/shared/ui";
import { IconButton, Pill, General } from "@fincheck/design-system";
import { Transaction } from "./transaction";
import { MonthSelector } from "./month-selector";
import { Link } from "@tanstack/react-router";
import { useTransactions } from "../model/use-transactions";
import { useTransactionsFilters } from "../model/use-transactions-filters";
import type { TransactionTypeFilter } from "../model/transactions-filters-store";
import { useEffect, useRef } from "react";

const filterItems = [
	{
		value: "transactions" as TransactionTypeFilter,
		icon: <General.Transactions />,
		label: "Transações",
	},
	{
		value: "revenue" as TransactionTypeFilter,
		icon: <General.Revenue />,
		label: "Receitas",
	},
	{
		value: "expense" as TransactionTypeFilter,
		icon: <General.Expense />,
		label: "Despesas",
	},
] as const;

export function TransactionsList() {
	const { filters, updateFilters } = useTransactionsFilters();
	const currentItem =
		filterItems.find((item) => item.value === filters.type) ?? filterItems[0];

	const { transactions, hasNextPage, isFetchingNextPage, fetchNextPage } =
		useTransactions();

	const loadMoreRef = useRef<HTMLDivElement>(null);
	const scrollContainerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const root = scrollContainerRef.current;
		const target = loadMoreRef.current;

		if (!root || !target) return;

		const observer = new IntersectionObserver(
			(entries) => {
				const [entry] = entries;
				if (entry?.isIntersecting && hasNextPage && !isFetchingNextPage) {
					fetchNextPage();
				}
			},
			{
				root,
				rootMargin: "100px",
				threshold: 0.1,
			},
		);

		const currentRef = loadMoreRef.current;
		if (currentRef) {
			observer.observe(currentRef);
		}

		return () => {
			if (currentRef) {
				observer.unobserve(currentRef);
			}
		};
	}, [hasNextPage, isFetchingNextPage, fetchNextPage]);

	const handleFilterChange = (value: string) => {
		updateFilters({ type: value as TransactionTypeFilter });
	};

	const hasTransactions = transactions.length > 0;

	return (
		<div className="flex flex-col h-full gap-8 overflow-hidden">
			<div className="flex justify-between shrink-0">
				<Pill value={filters.type} onValueChange={handleFilterChange}>
					<Pill.Trigger>
						{currentItem.icon}
						{currentItem.label}
					</Pill.Trigger>
					<Pill.Content>
						{filterItems.map((item) => (
							<Pill.Item key={item.value} value={item.value}>
								{item.icon}
								<Pill.ItemText>{item.label}</Pill.ItemText>
							</Pill.Item>
						))}
					</Pill.Content>
				</Pill>
				<Link to="/filters" search={(prev) => prev}>
					<IconButton icon="Filter" className="hover:bg-gray-1" />
				</Link>
			</div>
			<MonthSelector />
			<div ref={scrollContainerRef} className="flex-1 overflow-y-auto min-h-0">
				{hasTransactions ? (
					<div className="flex flex-col gap-4 overflow-hidden">
						{transactions.map((transaction) => (
							<Link
								key={transaction.id}
								to="/$id"
								params={{ id: transaction.id }}
								search={(prev) => prev}
							>
								<Transaction key={transaction.id} transaction={transaction} />
							</Link>
						))}
						{hasNextPage && (
							<div
								ref={loadMoreRef}
								className="flex items-center justify-center py-4"
							>
								<div className="flex items-center gap-2 text-gray-7">
									<div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-7 border-t-transparent" />
									<span className="text-sm">Carregando mais...</span>
								</div>
							</div>
						)}
						{isFetchingNextPage && !hasNextPage && (
							<div className="flex items-center justify-center py-4">
								<div className="flex items-center gap-2 text-gray-7">
									<div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-7 border-t-transparent" />
									<span className="text-sm">Carregando...</span>
								</div>
							</div>
						)}
					</div>
				) : (
					<EmptyState />
				)}
			</div>
		</div>
	);
}

function EmptyState() {
	return (
		<div className="flex flex-col items-center justify-start 2xl:justify-center gap-4 h-full">
			<NotFound />
			<p className="font-gilroy font-normal text-gray-7 flex text-center">
				Você ainda não cadastrou nada, <br /> você pode começar por suas contas,{" "}
				<br />
				depois receitas e despesas :)
			</p>
		</div>
	);
}
