import { AccountType } from "../entities/account-type.entity";

export abstract class AccountTypeRepository {
	abstract findAll(): Promise<AccountType[]>;
}
