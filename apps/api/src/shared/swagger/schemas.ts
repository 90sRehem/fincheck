import type { SchemaObject } from "@nestjs/swagger/dist/interfaces/open-api-spec.interface";

export const BankAccountResponseSchema: SchemaObject = {
	type: "object",
	properties: {
		id: {
			type: "string",
			format: "uuid",
			example: "550e8400-e29b-41d4-a716-446655440000",
		},
		name: { type: "string", example: "Conta Corrente Nubank" },
		accountType: {
			type: "object",
			properties: {
				id: { type: "string", example: "checking" },
				name: { type: "string", example: "Checking" },
			},
		},
		initialBalance: { type: "number", example: 1500.0 },
		currency: {
			type: "object",
			properties: {
				id: { type: "string", example: "BRL" },
				code: { type: "string", example: "BRL" },
				name: { type: "string", example: "Real Brasileiro" },
			},
		},
		color: {
			type: "object",
			properties: {
				id: { type: "string", example: "indigo" },
				name: { type: "string", example: "Indigo" },
				hex: { type: "string", example: "#4C6EF5" },
			},
		},
		icon: { type: "string", nullable: true, example: null },
		createdAt: {
			type: "string",
			format: "date-time",
			example: "2024-01-15T10:30:00.000Z",
		},
		updatedAt: {
			type: "string",
			format: "date-time",
			example: "2024-01-20T14:22:00.000Z",
		},
	},
};

export const ValidationErrorSchema: SchemaObject = {
	type: "object",
	properties: {
		statusCode: { type: "number", example: 400 },
		message: {
			oneOf: [
				{ type: "string", example: "Validation failed" },
				{
					type: "object",
					example: {
						name: ["name is required"],
						color: ["color must be a valid hex color (#RRGGBB)"],
					},
				},
			],
		},
		error: { type: "string", example: "Bad Request" },
	},
};

export const UnauthorizedErrorSchema: SchemaObject = {
	type: "object",
	properties: {
		statusCode: { type: "number", example: 401 },
		message: { type: "string", example: "Unauthorized" },
	},
};

export const NotFoundErrorSchema: SchemaObject = {
	type: "object",
	properties: {
		statusCode: { type: "number", example: 404 },
		message: { type: "string", example: "Bank account not found" },
		error: { type: "string", example: "Not Found" },
	},
};

export const TransactionResponseSchema: SchemaObject = {
	type: "object",
	properties: {
		id: {
			type: "string",
			format: "uuid",
			example: "550e8400-e29b-41d4-a716-446655440000",
		},
		userId: {
			type: "string",
			example: "user-id-123",
		},
		accountId: {
			type: "string",
			format: "uuid",
			example: "550e8400-e29b-41d4-a716-446655440001",
		},
		title: { type: "string", example: "Grocery shopping" },
		amountCents: { type: "integer", example: 5000 },
		type: {
			type: "string",
			enum: ["expense", "revenue"],
			example: "expense",
		},
		color: { type: "string", example: "#FF6B6B" },
		category: { type: "string", nullable: true, example: "Food" },
		date: {
			type: "string",
			format: "date-time",
			example: "2024-01-15T10:30:00.000Z",
		},
		createdAt: {
			type: "string",
			format: "date-time",
			example: "2024-01-15T10:30:00.000Z",
		},
		updatedAt: {
			type: "string",
			format: "date-time",
			example: "2024-01-20T14:22:00.000Z",
		},
	},
};

export const AccountTypeResponseSchema: SchemaObject = {
	type: "object",
	properties: {
		id: { type: "string", example: "checking" },
		name: { type: "string", example: "Checking" },
	},
};

export const ColorResponseSchema: SchemaObject = {
	type: "object",
	properties: {
		id: { type: "string", example: "indigo" },
		name: { type: "string", example: "Indigo" },
		hex: { type: "string", example: "#4C6EF5" },
	},
};

export const CurrencyResponseSchema: SchemaObject = {
	type: "object",
	properties: {
		id: { type: "string", example: "BRL" },
		code: { type: "string", example: "BRL" },
		name: { type: "string", example: "Real Brasileiro" },
	},
};
