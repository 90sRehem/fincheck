import {
	BadRequestException,
	Controller,
	Delete,
	HttpCode,
	NotFoundException,
	Param,
	ParseUUIDPipe,
} from "@nestjs/common";
import { Session } from "@thallesp/nestjs-better-auth";
import { NotFoundError } from "@/shared/domain/errors/not-found";
import { Either } from "@/shared/domain/types/either";
import { DeleteBankAccountUseCase } from "../domain";

@Controller("bank-accounts")
export class DeleteBankAccountController {
	constructor(
		private readonly deleteBankAccountUseCase: DeleteBankAccountUseCase,
	) {}

	@Delete(":id")
	@HttpCode(204)
	async delete(
		@Session() session: { userId: string },
		@Param("id", ParseUUIDPipe) id: string,
	) {
		const result = await this.deleteBankAccountUseCase.execute({
			id,
			userId: session.userId,
		});

		if (result.isFailure) {
			const error = result.value;
			if (error instanceof NotFoundError) {
				throw new NotFoundException(error.message);
			}
			throw new BadRequestException("Failed to delete bank account");
		}

		return undefined;
	}
}
