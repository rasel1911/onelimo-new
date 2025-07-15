import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({
	path: ".env.local",
});

if (!process.env.DATABASE_URL) {
	console.error("❌ DATABASE_URL environment variable is not set");
	throw new Error("DATABASE_URL environment variable is not set");
}

export default defineConfig({
	schema: "./db/schema/index.ts",
	out: "./db/migrations",
	dialect: "postgresql",
	dbCredentials: {
		url: process.env.DATABASE_URL!,
	},
	verbose: true,
	strict: true,
});
