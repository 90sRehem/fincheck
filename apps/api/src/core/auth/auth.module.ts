import { Module } from "@nestjs/common";
import { AuthModule as BetterAuthModule } from "@thallesp/nestjs-better-auth";
import { auth } from "./auth";
import { DatabaseModule } from "../database";
import { EnvModule } from "../env";
import { BetterAuthProvider } from "./auth.provider";

@Module({
	imports: [EnvModule, DatabaseModule],
	providers: [BetterAuthProvider],
	exports: [BetterAuthProvider],
})
export class AuthModule {}
