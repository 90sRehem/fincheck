import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "./core/auth";
import { DatabaseModule } from "./core/database";
import { EnvModule, envSchema } from "./core/env";
import { EventsModule } from "./core/events/events.module";

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			validate: (env) => envSchema.parse(env),
		}),
		EnvModule,
		DatabaseModule,
		EventsModule,
		AuthModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
