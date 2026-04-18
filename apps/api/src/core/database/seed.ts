import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { accountTypes } from "../../modules/bank-accounts/infra/drizzle/schemas/account-type-schema";
import { categories } from "../../modules/categories/infra/drizzle/schemas/category-schema";
import { colors } from "../../modules/colors/infra/drizzle/schemas/color-schema";
import { currencies } from "../../modules/currencies/infra/drizzle/schemas/currency-schema";

const COLORS = [
	{ id: "gray", name: "Gray", hex: "#868E96" },
	{ id: "green", name: "Green", hex: "#40C057" },
	{ id: "indigo", name: "Indigo", hex: "#4C6EF5" },
	{ id: "red", name: "Red", hex: "#FA5252" },
	{ id: "black", name: "Black", hex: "#000000" },
	{ id: "lime", name: "Lime", hex: "#82C91E" },
	{ id: "blue", name: "Blue", hex: "#228BE6" },
	{ id: "pink", name: "Pink", hex: "#E64980" },
	{ id: "white", name: "White", hex: "#FFFFFF" },
	{ id: "yellow", name: "Yellow", hex: "#FAB005" },
	{ id: "cyan", name: "Cyan", hex: "#15AABF" },
	{ id: "grape", name: "Grape", hex: "#BE4BDB" },
	{ id: "orange", name: "Orange", hex: "#FD7E14" },
	{ id: "teal", name: "Teal", hex: "#12B886" },
	{ id: "purple", name: "Purple", hex: "#7950F2" },
];

const ACCOUNT_TYPES = [
	{ id: "checking", name: "Checking" },
	{ id: "savings", name: "Savings" },
	{ id: "credit_card", name: "Credit Card" },
	{ id: "cash", name: "Cash" },
	{ id: "investment", name: "Investment" },
];

const CATEGORIES = [
	{ id: "food", name: "Alimentação" },
	{ id: "grocery", name: "Mercado" },
	{ id: "home", name: "Casa" },
	{ id: "education", name: "Educação" },
	{ id: "entertainment", name: "Lazer" },
	{ id: "clothing", name: "Roupas" },
	{ id: "health", name: "Saúde" },
	{ id: "transport", name: "Transporte" },
	{ id: "trip", name: "Viagem" },
	{ id: "revenue", name: "Receita" },
	{ id: "expense", name: "Outros" },
];

const CURRENCIES = [
	{ id: "BRL", code: "BRL", name: "Real Brasileiro" },
	{ id: "USD", code: "USD", name: "US Dollar" },
	{ id: "EUR", code: "EUR", name: "Euro" },
];

async function main() {
	const pool = new Pool({
		connectionString: process.env.DATABASE_URL,
	});

	const db = drizzle(pool);

	try {
		// Seed colors
		await db.insert(colors).values(COLORS).onConflictDoNothing();

		// Seed account types
		await db.insert(accountTypes).values(ACCOUNT_TYPES).onConflictDoNothing();

		// Seed categories
		await db.insert(categories).values(CATEGORIES).onConflictDoNothing();

		// Seed currencies
		await db.insert(currencies).values(CURRENCIES).onConflictDoNothing();

		console.log(
			`✓ Seeded ${COLORS.length} colors, ${ACCOUNT_TYPES.length} account types, ${CATEGORIES.length} categories, and ${CURRENCIES.length} currencies`,
		);
	} catch (error) {
		console.error("Error seeding database:", error);
		process.exit(1);
	} finally {
		await pool.end();
	}
}

main();
