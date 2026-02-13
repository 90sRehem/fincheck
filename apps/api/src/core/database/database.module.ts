import { Global, Module } from "@nestjs/common";
import { EnvModule, EnvService } from "../env";
import { createDrizzleConnection, DrizzleDB } from "./connection";
import { DRIZZLE_DB } from "./constants";

@Global()
@Module({
	exports: [DRIZZLE_DB],
	imports: [EnvModule],
	providers: [
		{
			provide: DRIZZLE_DB,
			inject: [EnvService],
			useFactory: (envService: EnvService): DrizzleDB => {
				const databaseUrl = envService.get("DATABASE_URL");
				return createDrizzleConnection(databaseUrl);
			},
		},
	],
})
export class DatabaseModule {}
