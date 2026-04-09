import {
	BadRequestException,
	Body,
	Controller,
	HttpCode,
	Post,
} from "@nestjs/common";
import { Session } from "@thallesp/nestjs-better-auth";
import { Either } from "@/shared/domain/types/either";
import { ValidationFieldsError } from "@/shared/domain/validators/validation-fields-error";
import { CreateBankAccountUseCase } from "../domain";
import { BankAccountMapper } from "../infra/mappers/bank-account.mapper";
import { createBankAccountSchema } from "./create-bank-account.dto";

@Controller("bank-accounts")
export class CreateBankAccountController {
	constructor(
		private readonly createBankAccountUseCase: CreateBankAccountUseCase,
	) {}

	@Post()
	@HttpCode(201)
	async create(
		@Session() session: { userId: string },
		@Body() body: unknown,
	) {
		const parseResult = createBankAccountSchema.safeParse(body);

		if (!parseResult.success) {
			throw new BadRequestException(parseResult.error.flatten().fieldErrors);
		}

		const result = await this.createBankAccountUseCase.execute({
			userId: session.userId,
			...parseResult.data,
		});

		if (result.isFailure) {
			const error = result.value;
			if (error instanceof ValidationFieldsError) {
				throw new BadRequestException(error.errors);
			}
			throw new BadRequestException("Failed to create bank account");
		}

		return BankAccountMapper.toResponse(result.value as any);
	}
}
