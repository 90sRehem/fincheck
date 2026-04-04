import { Module } from "@nestjs/common";
import { AuthModule as BetterAuthModule } from "@thallesp/nestjs-better-auth";
import { DatabaseModule } from "../database";
import { EnvModule } from "../env";
import { auth } from "./auth";
import { BetterAuthProvider } from "./auth.provider";

@Module({
	imports: [EnvModule, DatabaseModule, BetterAuthModule.forRoot({ auth })],
	providers: [BetterAuthProvider],
	exports: [BetterAuthProvider],
})
export class AuthModule {}
