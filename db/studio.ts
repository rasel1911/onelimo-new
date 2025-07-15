import { spawn } from "child_process";
import path from "path";

import { config } from "dotenv";

config({
	path: path.resolve(process.cwd(), ".env.local"),
});

if (!process.env.POSTGRES_URL) {
	console.error("❌ POSTGRES_URL environment variable is not set");
	process.exit(1);
}

console.log("🚀 Starting Drizzle Studio...");

const studio = spawn("npx", ["drizzle-kit", "studio", "--verbose"], {
	stdio: "inherit",
	shell: true,
});

studio.on("error", (err) => {
	console.error(`❌ Failed to start Drizzle Studio: ${err.message}`);
	process.exit(1);
});

process.on("SIGINT", () => {
	console.log("⏹️ Stopping Drizzle Studio...");
	studio.kill("SIGINT");
	process.exit(0);
});

console.log("✅ If successful, Drizzle Studio should be running at http://localhost:3333");
