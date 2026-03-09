const http = require("http");

const options = {
	hostname: "localhost",
	port: process.env.PORT || 3333,
	path: "/api/health-check",
	method: "GET",
	timeout: 5000,
};

const req = http.request(options, (res) => {
	console.log(`Health check status: ${res.statusCode}`);

	if (res.statusCode >= 200 && res.statusCode < 300) {
		process.exit(0); // Sucesso
	} else {
		console.error(`Health check failed with status: ${res.statusCode}`);
		process.exit(1); // Falha
	}
});

req.on("error", (err) => {
	console.error("Health check error:", err.message);
	process.exit(1); // Falha
});

req.on("timeout", () => {
	console.error("Health check timeout");
	req.destroy();
	process.exit(1); // Falha
});

req.end();
