import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({
  path: ".env.local",
});

// Validate database URL
if (!process.env.POSTGRES_URL) {
  console.error("❌ POSTGRES_URL environment variable is not set");
  throw new Error("POSTGRES_URL environment variable is not set");
}

export default defineConfig({
  schema: "./db/schema/index.ts",
  out: "./db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.POSTGRES_URL!,
  },
  // Studio-specific settings
  verbose: true,
  strict: true,
});
