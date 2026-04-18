import type { Colors } from "@fincheck/design-system";
import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";
import { apiClient } from "@/shared/api";
import type { PaginatedResponse } from "@/shared/lib";
import { getCategoryMapping } from "../lib/category-mapping";

export type TransactionType = "expense" | "revenue";

export type Transaction = {
	id: string;
	userId: string;
	accountId: string;
	title: string;
	amountCents: number;
	type: TransactionType;
	color: Colors;
	category?: string;
	date: string;
	createdAt: string;
	updatedAt: string;
};

export type TransactionSortField = keyof Transaction;

export type ListTransactionsRequest = {
	userId: string;
	accountId?: string;
	year?: number;
	month?: number;
	type?: "transactions" | TransactionType;
	page?: number;
	limit?: number;
	_sort?: TransactionSortField;
	_order?: "asc" | "desc";
};

export type ListTransactionsResponse = PaginatedResponse<Transaction>;

export type CreateTransactionRequest = {
	userId: string;
	accountId: string;
	title: string;
	amountCents: number;
	type: TransactionType;
	color?: Colors;
	category: string;
	date: string;
};

export async function listTransactions({
	userId,
	accountId,
	year,
	month,
	type,
	page = 1,
	limit = 10,
	_sort = "createdAt",
	_order = "desc",
}: ListTransactionsRequest): Promise<ListTransactionsResponse> {
	const params: Record<string, string | number> = {
		userId,
		_page: page,
		_limit: limit,
		_order,
		_sort,
	};

	if (accountId) {
		params.accountId = accountId;
	}

	if (year) {
		params.year = year;
	}

	if (month) {
		params.month = month;
	}

	if (type && type !== "transactions") {
		params.type = type;
	}

	const response = await apiClient.get<Transaction[]>({
		url: "/transactions",
		params,
	});

	const totalCount = response.headers?.["x-total-count"];
	const total = totalCount ? Number.parseInt(totalCount, 10) : 0;
	const totalPages = Math.ceil(total / limit);
	const hasNextPage = page < totalPages;

	return {
		data: response.data,
		pagination: {
			currentPage: page,
			totalPages,
			totalItems: total,
			itemsPerPage: limit,
			hasNextPage,
		},
	};
}

export function createTransaction(
	data: CreateTransactionRequest,
): Promise<{ data: Transaction }> {
	const mapping = getCategoryMapping(data.category);

	const transactionData = {
		userId: data.userId,
		accountId: data.accountId,
		title: data.title,
		amountCents: data.amountCents,
		type: data.type,
		color: data.color ?? mapping.color,
		category: data.category,
		date: data.date,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	};

	return apiClient.post<Transaction>({
		url: "/transactions",
		body: transactionData,
	});
}

export type UpdateTransactionRequest = Partial<CreateTransactionRequest> & {
	id: string;
};

export function updateTransaction(
	data: Partial<UpdateTransactionRequest>,
): Promise<{ data: Transaction }> {
	return apiClient.put({
		url: `/transactions/${data.id}`,
		body: data,
	});
}

export type GetTransactionRequest = {
	id: string;
};

async function getTransaction({ id }: GetTransactionRequest) {
	if (!id) {
		return;
	}
	const response = await apiClient.get<Transaction>({
		url: `/transactions/${id}`,
	});
	return response.data;
}

export type RemoveTransactionRequest = {
	transactionId: string;
};

export async function removeTransaction({
	transactionId,
}: RemoveTransactionRequest) {
	const response = await apiClient.delete<Transaction>({
		url: `/transactions/${transactionId}`,
	});
	return response.data;
}

export const transactionsQueryFactory = {
	all: ["transactions"] as const,
	list: (filters: Omit<ListTransactionsRequest, "page" | "limit">) =>
		infiniteQueryOptions({
			queryKey: [...transactionsQueryFactory.all, "list", filters],
			queryFn: ({ pageParam = 1 }) =>
				listTransactions({ ...filters, page: pageParam }),
			getNextPageParam: (lastPage) => {
				return lastPage.pagination.hasNextPage
					? lastPage.pagination.currentPage + 1
					: undefined;
			},
			initialPageParam: 1,
		}),
	getTransaction: ({ id }: GetTransactionRequest) =>
		queryOptions({
			queryKey: [...transactionsQueryFactory.all, id],
			queryFn: () => getTransaction({ id }),
		}),
};
