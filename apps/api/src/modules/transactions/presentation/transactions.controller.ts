import {
	BadRequestException,
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	NotFoundException,
	Param,
	ParseUUIDPipe,
	Post,
	Put,
	Query,
	Res,
} from "@nestjs/common";
import {
	ApiBody,
	ApiCookieAuth,
	ApiOperation,
	ApiParam,
	ApiResponse,
	ApiTags,
} from "@nestjs/swagger";
import { Session } from "@thallesp/nestjs-better-auth";
import type { Response } from "express";
import { NotFoundError } from "@/shared/domain/errors";
import { ValidationFieldsError } from "@/shared/domain/validators/validation-fields-error";
import {
	UnauthorizedErrorSchema,
	ValidationErrorSchema,
} from "@/shared/swagger/schemas";
import {
	type CreateTransactionInput,
	createTransactionSchema,
} from "../application/create-transaction/create-transaction.dto";
import { CreateTransactionService } from "../application/create-transaction/create-transaction.service";
import { GetTransactionService } from "../application/get-transaction/get-transaction.service";
import {
	type ListTransactionsInput,
	listTransactionsSchema,
} from "../application/list-transactions/list-transactions.dto";
import { ListTransactionsService } from "../application/list-transactions/list-transactions.service";
import { RemoveTransactionService } from "../application/remove-transaction/remove-transaction.service";
import {
	type UpdateTransactionInput,
	updateTransactionSchema,
} from "../application/update-transaction/update-transaction.dto";
import { UpdateTransactionService } from "../application/update-transaction/update-transaction.service";
import { Transaction, type TransactionProps } from "../domain";
import { TransactionMapper } from "../infra/mappers/transaction.mapper";

@ApiTags("Transactions")
@ApiCookieAuth("better-auth.session_token")
@Controller("transactions")
export class TransactionsController {
	constructor(
		private readonly createTransactionService: CreateTransactionService,
		private readonly getTransactionService: GetTransactionService,
		private readonly listTransactionsService: ListTransactionsService,
		private readonly updateTransactionService: UpdateTransactionService,
		private readonly removeTransactionService: RemoveTransactionService,
	) {}

	@Post()
	@HttpCode(HttpStatus.CREATED)
	@ApiOperation({
		summary: "Create Transaction",
		description: "Creates a new transaction for the authenticated user.",
	})
	@ApiBody({ description: "Transaction data" })
	@ApiResponse({ status: 201, description: "Transaction created successfully" })
	@ApiResponse({
		status: 400,
		description: "Invalid data",
		schema: ValidationErrorSchema,
	})
	@ApiResponse({
		status: 401,
		description: "Unauthorized",
		schema: UnauthorizedErrorSchema,
	})
	async create(@Session() session: { userId: string }, @Body() body: unknown) {
		const parseResult = createTransactionSchema.safeParse(body);

		if (!parseResult.success) {
			throw new BadRequestException(parseResult.error.flatten().fieldErrors);
		}

		const data = parseResult.data as CreateTransactionInput;
		const result = await this.createTransactionService.execute({
			userId: session.userId,
			accountId: data.accountId,
			title: data.title,
			amountCents: data.amountCents,
			type: data.type,
			color: data.color,
			category: data.category ?? null,
			date: data.date,
		});

		if (result.isFailure) {
			const error = result.value;
			if (error instanceof ValidationFieldsError) {
				throw new BadRequestException(error.errors);
			}
			throw new BadRequestException("Failed to create transaction");
		}

		return TransactionMapper.toResponse(result.value as Transaction);
	}

	@Get()
	@ApiOperation({
		summary: "List Transactions",
		description:
			"Returns all transactions for the authenticated user with pagination.",
	})
	@ApiResponse({
		status: 200,
		description: "List of transactions",
	})
	@ApiResponse({
		status: 401,
		description: "Unauthorized",
		schema: UnauthorizedErrorSchema,
	})
	async list(
		@Session() session: { userId: string },
		@Query() query: unknown,
		@Res({ passthrough: true }) res: Response,
	) {
		const parseResult = listTransactionsSchema.safeParse(query);

		if (!parseResult.success) {
			throw new BadRequestException(parseResult.error.flatten().fieldErrors);
		}

		const result = await this.listTransactionsService.execute({
			userId: session.userId,
			filters: {
				accountId: (parseResult.data as ListTransactionsInput).accountId,
				year: (parseResult.data as ListTransactionsInput).year,
				month: (parseResult.data as ListTransactionsInput).month,
				type: (parseResult.data as ListTransactionsInput).type,
			},
			page: (parseResult.data as ListTransactionsInput)._page,
			limit: (parseResult.data as ListTransactionsInput)._limit,
			sort: (parseResult.data as ListTransactionsInput)._sort,
			order: (parseResult.data as ListTransactionsInput)._order,
		});

		if (result.isFailure) {
			throw new BadRequestException("Failed to list transactions");
		}

		const paginatedResult = result.value;
		res.setHeader("x-total-count", paginatedResult.totalCount);

		return paginatedResult.data.map((transaction) =>
			TransactionMapper.toResponse(transaction),
		);
	}

	@Get(":id")
	@ApiOperation({
		summary: "Get Transaction",
		description: "Returns a single transaction by ID.",
	})
	@ApiParam({ name: "id", type: "string", format: "uuid" })
	@ApiResponse({ status: 200, description: "Transaction found" })
	@ApiResponse({
		status: 404,
		description: "Transaction not found",
	})
	@ApiResponse({
		status: 401,
		description: "Unauthorized",
		schema: UnauthorizedErrorSchema,
	})
	async getById(
		@Session() session: { userId: string },
		@Param("id", ParseUUIDPipe) id: string,
	) {
		const result = await this.getTransactionService.execute({
			id,
			userId: session.userId,
		});

		if (result.isFailure) {
			const error = result.value;
			if (error instanceof NotFoundError) {
				throw new NotFoundException(error.message);
			}
			throw new BadRequestException("Failed to get transaction");
		}

		return TransactionMapper.toResponse(result.value as Transaction);
	}

	@Put(":id")
	@ApiOperation({
		summary: "Update Transaction",
		description: "Updates a transaction by ID.",
	})
	@ApiParam({ name: "id", type: "string", format: "uuid" })
	@ApiBody({ description: "Transaction data" })
	@ApiResponse({ status: 200, description: "Transaction updated successfully" })
	@ApiResponse({
		status: 400,
		description: "Invalid data",
		schema: ValidationErrorSchema,
	})
	@ApiResponse({
		status: 404,
		description: "Transaction not found",
	})
	@ApiResponse({
		status: 401,
		description: "Unauthorized",
		schema: UnauthorizedErrorSchema,
	})
	async update(
		@Session() session: { userId: string },
		@Param("id", ParseUUIDPipe) id: string,
		@Body() body: unknown,
	) {
		const parseResult = updateTransactionSchema.safeParse(body);

		if (!parseResult.success) {
			throw new BadRequestException(parseResult.error.flatten().fieldErrors);
		}

		const data = parseResult.data as UpdateTransactionInput;
		const updateData: Partial<Omit<TransactionProps, "userId">> = {};

		if (data.accountId !== undefined) updateData.accountId = data.accountId;
		if (data.title !== undefined) updateData.title = data.title;
		if (data.amountCents !== undefined)
			updateData.amountCents = data.amountCents;
		if (data.type !== undefined) updateData.type = data.type;
		if (data.color !== undefined) updateData.color = data.color;
		if (data.category !== undefined) updateData.category = data.category;
		if (data.date !== undefined) updateData.date = new Date(data.date);

		const result = await this.updateTransactionService.execute({
			id,
			userId: session.userId,
			data: updateData,
		});

		if (result.isFailure) {
			const error = result.value;
			if (error instanceof NotFoundError) {
				throw new NotFoundException(error.message);
			}
			if (error instanceof ValidationFieldsError) {
				throw new BadRequestException(error.errors);
			}
			throw new BadRequestException("Failed to update transaction");
		}

		return TransactionMapper.toResponse(result.value as Transaction);
	}

	@Delete(":id")
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiOperation({
		summary: "Delete Transaction",
		description: "Deletes a transaction by ID.",
	})
	@ApiParam({ name: "id", type: "string", format: "uuid" })
	@ApiResponse({ status: 204, description: "Transaction deleted successfully" })
	@ApiResponse({
		status: 404,
		description: "Transaction not found",
	})
	@ApiResponse({
		status: 401,
		description: "Unauthorized",
		schema: UnauthorizedErrorSchema,
	})
	async delete(
		@Session() session: { userId: string },
		@Param("id", ParseUUIDPipe) id: string,
	) {
		const result = await this.removeTransactionService.execute({
			id,
			userId: session.userId,
		});

		if (result.isFailure) {
			const error = result.value;
			if (error instanceof NotFoundError) {
				throw new NotFoundException(error.message);
			}
			throw new BadRequestException("Failed to delete transaction");
		}

		return undefined;
	}
}
