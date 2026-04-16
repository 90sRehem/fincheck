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
		type: {
			type: "string",
			enum: ["checking", "savings", "credit_card", "cash", "investment"],
			example: "checking",
		},
		initialBalance: { type: "number", example: 1500.0 },
		currentBalance: { type: "number", example: 1350.75 },
		currency: { type: "string", example: "BRL" },
		color: { type: "string", example: "#8B5CF6" },
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
