import { AccountType } from "../entities/account-type.entity";

export abstract class AccountTypeRepository {
	abstract findById(id: string): Promise<AccountType | null>;
	abstract findAll(): Promise<AccountType[]>;
}
