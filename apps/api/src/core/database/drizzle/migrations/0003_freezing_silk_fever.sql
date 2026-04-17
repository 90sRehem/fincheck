CREATE TYPE "public"."transaction_type" AS ENUM('expense', 'revenue');--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"account_id" text NOT NULL,
	"title" text NOT NULL,
	"amount_cents" integer NOT NULL,
	"type" "transaction_type" NOT NULL,
	"color" text NOT NULL,
	"category" text,
	"date" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_account_id_bank_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."bank_accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "transactions_userId_idx" ON "transactions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "transactions_accountId_idx" ON "transactions" USING btree ("account_id");--> statement-breakpoint
CREATE INDEX "transactions_date_idx" ON "transactions" USING btree ("date");