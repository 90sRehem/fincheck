import { NestFactory } from "@nestjs/core";
import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import { FastifyAdapter } from "@nestjs/platform-fastify";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { apiReference } from "@scalar/nestjs-api-reference";
import { AppModule } from "./app.module";

const PORT = 3333;

async function bootstrap() {
	const app = await NestFactory.create<NestFastifyApplication>(
		AppModule,
		new FastifyAdapter({ logger: process.env.NODE_ENV === "development" }),
	);

	app.enableCors();

	app.setGlobalPrefix("api");

	const config = new DocumentBuilder()
		.setTitle("Fincheck API")
		.setDescription("Fincheck API")
		.setVersion("1.0")
		.build();

	const document = SwaggerModule.createDocument(app, config);

	SwaggerModule.setup("/docs", app, document);

	app.use("/docs", apiReference({ content: document, withFastify: true }));
	await app.listen(process.env.PORT ?? PORT);
}

bootstrap()
	.then(() => {
		console.log(`Server is running on port ${PORT}`);
	})
	.catch((err) => {
		console.error(err);
	});
