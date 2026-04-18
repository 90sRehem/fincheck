import { Injectable } from "@nestjs/common";
import {
	AccountTypeRepository,
	BankAccountRepository,
	ColorRepository,
	CreateBankAccountUseCase,
	CurrencyRepository,
} from "@/modules/bank-accounts/domain";
import { DomainEventDispatcher } from "@/shared/domain/events";
import { failure } from "@/shared/domain/types/either";
import { ValidationFieldsError } from "@/shared/domain/validators/validation-fields-error";

export interface CreateBankAccountServiceInput {
	userId: string;
	name: string;
	accountTypeId: string;
	currencyId: string;
	colorId: string;
	initialBalance: number;
	icon?: string | null;
}

@Injectable()
export class CreateBankAccountService extends CreateBankAccountUseCase {
	private readonly dispatcher: DomainEventDispatcher;
	private readonly colorRepository: ColorRepository;
	private readonly currencyRepository: CurrencyRepository;
	private readonly accountTypeRepository: AccountTypeRepository;

	constructor(
		bankAccountRepository: BankAccountRepository,
		dispatcher: DomainEventDispatcher,
		colorRepository: ColorRepository,
		currencyRepository: CurrencyRepository,
		accountTypeRepository: AccountTypeRepository,
	) {
		super(bankAccountRepository);
		this.dispatcher = dispatcher;
		this.colorRepository = colorRepository;
		this.currencyRepository = currencyRepository;
		this.accountTypeRepository = accountTypeRepository;
	}

	async create(input: CreateBankAccountServiceInput) {
		const [color, currency, accountType] = await Promise.all([
			this.colorRepository.findById(input.colorId),
			this.currencyRepository.findById(input.currencyId),
			this.accountTypeRepository.findById(input.accountTypeId),
		]);

		const errors: { field: string; message: string }[] = [];
		if (!color)
			errors.push({
				field: "colorId",
				message: `Color '${input.colorId}' not found`,
			});
		if (!currency)
			errors.push({
				field: "currencyId",
				message: `Currency '${input.currencyId}' not found`,
			});
		if (!accountType)
			errors.push({
				field: "accountTypeId",
				message: `AccountType '${input.accountTypeId}' not found`,
			});

		if (errors.length > 0) return failure(new ValidationFieldsError(errors));

		const result = await super.execute({
			userId: input.userId,
			name: input.name,
			initialBalance: input.initialBalance,
			icon: input.icon,
			// biome-ignore lint/style/noNonNullAssertion: existência validada acima
			accountType: accountType!,
			// biome-ignore lint/style/noNonNullAssertion: existência validada acima
			color: color!,
			// biome-ignore lint/style/noNonNullAssertion: existência validada acima
			currency: currency!,
		});

		if (result.isSuccess) {
			await this.dispatcher.dispatchAll(result.value);
		}

		return result;
	}
}
