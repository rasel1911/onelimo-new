#!/usr/bin/env tsx

import { createUser, getUserByEmailOrPhone } from "./script-user.queries";

async function createAdminFromArgs() {
	const args = process.argv.slice(2);

	if (args.length < 4) {
		console.log("Usage: tsx scripts/create-admin.ts <name> <email> <phone> <password>");
		console.log("");
		console.log("Example:");
		console.log(
			'  tsx scripts/create-admin.ts "John Doe" "john@example.com" "+1234567890" "securepassword123"',
		);
		console.log("");
		console.log(
			"⚠️  Note: This creates an admin user directly. Use quotes for values with spaces.",
		);
		process.exit(1);
	}

	const [name, email, phone, password] = args;

	// Validate inputs
	if (!name.trim()) {
		console.error("❌ Name cannot be empty");
		process.exit(1);
	}

	if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
		console.error("❌ Invalid email format");
		process.exit(1);
	}

	if (!/^[\+]?[1-9][\d]{0,15}$/.test(phone.replace(/[\s\-\(\)]/g, ""))) {
		console.error("❌ Invalid phone number format");
		process.exit(1);
	}

	if (password.length < 8) {
		console.error("❌ Password must be at least 8 characters long");
		process.exit(1);
	}

	try {
		// Check if user already exists
		const existingUsers = await getUserByEmailOrPhone(email);
		if (existingUsers.length > 0) {
			console.error("❌ User with this email already exists");
			process.exit(1);
		}

		console.log("🔧 Creating admin user...");

		await createUser(email, password, name, phone, {
			role: "admin",
			status: "active",
		});

		console.log("✅ Admin user created successfully!");
		console.log(`📧 Email: ${email}`);
		console.log(`👤 Name: ${name}`);
		console.log(`📱 Phone: ${phone}`);
		console.log(`🔐 Role: admin`);
	} catch (error) {
		console.error(
			"❌ Error creating admin user:",
			error instanceof Error ? error.message : "Unknown error",
		);
		process.exit(1);
	}
}

// Handle cleanup
process.on("SIGINT", () => {
	console.log("\n👋 Goodbye!");
	process.exit(0);
});

// Run the script
createAdminFromArgs().catch((error) => {
	console.error("❌ Script failed:", error instanceof Error ? error.message : "Unknown error");
	process.exit(1);
});
