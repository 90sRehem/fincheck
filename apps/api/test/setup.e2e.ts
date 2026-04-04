import "reflect-metadata";

beforeAll(() => {
	process.env.NODE_ENV = "test";
});

afterAll(async () => {
	await new Promise((resolve) => setTimeout(resolve, 500));
});
