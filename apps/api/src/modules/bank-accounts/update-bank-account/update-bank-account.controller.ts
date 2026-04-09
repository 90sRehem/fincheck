import {
	BadRequestException,
	Body,
	Controller,
	HttpCode,
	NotFoundException,
	Param,
	ParseUUIDPipe,
	Put,
} from "@nestjs/common";
import { Session } from "@thallesp/nestjs-better-auth";
import { NotFoundError } from "@/shared/domain/errors/not-found";
import { Either } from "@/shared/domain/types/either";
import { ValidationFieldsError } from "@/shared/domain/validators/validation-fields-error";
import { UpdateBankAccountUseCase } from "../domain";
import { BankAccountMapper } from "../infra/mappers/bank-account.mapper";
import { updateBankAccountSchema } from "./update-bank-account.dto";

@Controller("bank-accounts")
export class UpdateBankAccountController {
	constructor(
		private readonly updateBankAccountUseCase: UpdateBankAccountUseCase,
	) {}

	@Put(":id")
	@HttpCode(200)
	async update(
		@Session() session: { userId: string },
		@Param("id", ParseUUIDPipe) id: string,
		@Body() body: unknown,
	) {
		const parseResult = updateBankAccountSchema.safeParse(body);

		if (!parseResult.success) {
			throw new BadRequestException(parseResult.error.flatten().fieldErrors);
		}

		const result = await this.updateBankAccountUseCase.execute({
			id,
			userId: session.userId,
			data: parseResult.data,
		});

		if (result.isFailure) {
			const error = result.value;
			if (error instanceof NotFoundError) {
				throw new NotFoundException(error.message);
			}
			if (error instanceof ValidationFieldsError) {
				throw new BadRequestException(error.errors);
			}
			throw new BadRequestException("Failed to update bank account");
		}

		return BankAccountMapper.toResponse(result.value as any);
	}
}
