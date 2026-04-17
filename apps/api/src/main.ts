/** biome-ignore-all lint/style/noMagicNumbers: <explanation> */
import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { apiReference } from "@scalar/nestjs-api-reference";
import { AppModule } from "./app.module";

const PORT = process.env.PORT ?? 3333;

async function bootstrap() {
	const app = await NestFactory.create<NestExpressApplication>(AppModule);

	app.enableCors({
		origin: process.env.WEB_CLIENT_URL,
		credentials: true,
	});
	app.set("x-powered-by", false);
	app.setGlobalPrefix("api");

	const config = new DocumentBuilder()
		.setTitle("Fincheck API")
		.setDescription(
			"API de gerenciamento de finanças pessoais. Todos os endpoints requerem autenticação via sessão (cookie `better-auth.session_token`).",
		)
		.setVersion("1.0")
		.addCookieAuth("better-auth.session_token")
		.addTag("Health", "Status da API")
		.addTag("Bank Accounts", "Gerenciamento de contas bancárias")
		.build();

	const document = SwaggerModule.createDocument(app, config);
	app.use("/docs", apiReference({ content: document }));
	await app.listen(process.env.PORT ?? PORT);
}

bootstrap()
	.then(() => {
		console.log(`Server is running on port ${PORT}`);
	})
	.catch((err) => {
		console.error(err);
	});
