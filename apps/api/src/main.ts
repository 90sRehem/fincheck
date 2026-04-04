/** biome-ignore-all lint/style/noMagicNumbers: <explanation> */
import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { apiReference } from "@scalar/nestjs-api-reference";
import { AppModule } from "./app.module";

const PORT = process.env.PORT ?? 3333;

async function bootstrap() {
	const app = await NestFactory.create<NestExpressApplication>(AppModule);

	app.enableCors();
	app.set("x-powered-by", false);
	app.setGlobalPrefix("api");

	const config = new DocumentBuilder()
		.setTitle("Fincheck API")
		.setDescription("Fincheck API")
		.setVersion("1.0")
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
