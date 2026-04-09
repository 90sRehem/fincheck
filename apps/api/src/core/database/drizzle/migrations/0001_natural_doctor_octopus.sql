CREATE TYPE "public"."bank_account_type" AS ENUM('checking', 'savings', 'credit_card', 'cash', 'investment');--> statement-breakpoint
CREATE TABLE "bank_accounts" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"type" "bank_account_type" NOT NULL,
	"initial_balance" numeric(12, 2) DEFAULT '0' NOT NULL,
	"current_balance" numeric(12, 2) DEFAULT '0' NOT NULL,
	"currency" text DEFAULT 'BRL' NOT NULL,
	"color" text NOT NULL,
	"icon" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "bank_accounts" ADD CONSTRAINT "bank_accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "bankAccounts_userId_idx" ON "bank_accounts" USING btree ("user_id");