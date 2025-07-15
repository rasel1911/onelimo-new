import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

config({ path: ".env.local" });

const getDatabaseUrl = (): string => {
	const postgresUrl = process.env.POSTGRES_URL;
	const databaseUrl = process.env.DATABASE_URL;

	if (postgresUrl) {
		return postgresUrl;
	}

	if (databaseUrl) {
		return databaseUrl;
	}

	console.error(
		"❌ Database URL not found. Please set POSTGRES_URL or DATABASE_URL environment variable.",
	);
	console.error("Example: POSTGRES_URL=postgresql://user:password@host:port/database");
	process.exit(1);
};

const databaseUrl = getDatabaseUrl();
const client = postgres(`${databaseUrl}?sslmode=require`);
export const db = drizzle(client);

export default db;
