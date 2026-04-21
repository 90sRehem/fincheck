export const TRANSACTION_COLOR = {
	GRAY: "gray",
	RED: "red",
	PINK: "pink",
	GRAPE: "grape",
	VIOLET: "violet",
	INDIGO: "indigo",
	BLUE: "blue",
	CYAN: "cyan",
	TEAL: "teal",
	GREEN: "green",
	LIME: "lime",
	YELLOW: "yellow",
	ORANGE: "orange",
} as const;

export type TransactionColor =
	(typeof TRANSACTION_COLOR)[keyof typeof TRANSACTION_COLOR];
