CREATE TABLE "balances" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"bank_account_id" text NOT NULL,
	"amount_cents" bigint DEFAULT 0 NOT NULL,
	"currency" text DEFAULT 'BRL' NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "balances_bankAccountId_unique" UNIQUE("bank_account_id")
);
--> statement-breakpoint
ALTER TABLE "balances" ADD CONSTRAINT "balances_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "balances" ADD CONSTRAINT "balances_bank_account_id_bank_accounts_id_fk" FOREIGN KEY ("bank_account_id") REFERENCES "public"."bank_accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "balances_userId_idx" ON "balances" USING btree ("user_id");--> statement-breakpoint
ALTER TABLE "bank_accounts" DROP COLUMN "current_balance";