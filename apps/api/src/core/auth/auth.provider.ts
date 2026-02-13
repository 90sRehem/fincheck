import { Provider } from "@nestjs/common";
import { DrizzleDB } from "../database/connection";
import { DRIZZLE_DB } from "../database/constants";
import { EnvService } from "../env";
import { createAuthConfig } from "./auth.config";

export const BetterAuthProvider: Provider = {
	provide: "BETTER_AUTH",
	inject: [DRIZZLE_DB, EnvService],
	useFactory: (db: DrizzleDB, env: EnvService) => {
		return createAuthConfig(db, env);
	},
};
