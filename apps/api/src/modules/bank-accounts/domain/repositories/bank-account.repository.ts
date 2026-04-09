import { BankAccount } from "../entities/bank-account.entity";

export abstract class BankAccountRepository {
	abstract create(bankAccount: BankAccount): Promise<BankAccount>;
	abstract findById(id: string, userId: string): Promise<BankAccount | null>;
	abstract findAllByUserId(userId: string): Promise<BankAccount[]>;
	abstract update(bankAccount: BankAccount): Promise<BankAccount>;
	abstract delete(id: string, userId: string): Promise<void>;
}
