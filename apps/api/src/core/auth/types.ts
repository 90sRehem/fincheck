export type AuthSession = Readonly<{
	user: Readonly<{
		id: string;
		name: string | null;
		email: string;
		image: string | null;
		createdAt: Date;
		updatedAt: Date;
	}>;
	session: Readonly<{
		id: string;
		userId: string;
		token: string;
		expiresAt: Date;
	}>;
}>;
