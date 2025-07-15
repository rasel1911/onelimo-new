#!/usr/bin/env tsx

import * as readline from "readline";

import {
	createUser,
	updateUser,
	getUserByEmailOrPhone,
	getUsersByRole,
} from "./script-user.queries";

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
});

function question(prompt: string): Promise<string> {
	return new Promise((resolve) => {
		rl.question(prompt, resolve);
	});
}

function hiddenQuestion(prompt: string): Promise<string> {
	return new Promise((resolve) => {
		const stdin = process.stdin;
		const stdout = process.stdout;

		stdout.write(prompt);
		stdin.resume();
		stdin.setRawMode!(true);
		stdin.setEncoding("utf8");

		let password = "";

		const onData = (char: string) => {
			switch (char) {
				case "\n":
				case "\r":
				case "\u0004": // Ctrl+D
					stdin.setRawMode!(false);
					stdin.pause();
					stdout.write("\n");
					stdin.removeListener("data", onData);
					resolve(password);
					break;
				case "\u0003": // Ctrl+C
					process.exit();
					break;
				case "\u007f": // Backspace
					if (password.length > 0) {
						password = password.slice(0, -1);
						stdout.write("\b \b");
					}
					break;
				default:
					stdout.write("*");
					password += char;
					break;
			}
		};

		stdin.on("data", onData);
	});
}

function validateEmail(email: string): boolean {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhone(phone: string): boolean {
	return /^[\+]?[1-9][\d]{0,15}$/.test(phone.replace(/[\s\-\(\)]/g, ""));
}

function validatePassword(password: string): boolean {
	return password.length >= 8;
}

async function createAdminUser(): Promise<void> {
	console.log("\n🔧 Creating New Admin User");
	console.log("================================");

	try {
		const name = await question("Enter full name: ");
		if (!name.trim()) {
			console.log("❌ Name cannot be empty");
			return;
		}

		const email = await question("Enter email: ");
		if (!validateEmail(email)) {
			console.log("❌ Invalid email format");
			return;
		}

		// Check if user already exists
		const existingUsers = await getUserByEmailOrPhone(email);
		if (existingUsers.length > 0) {
			console.log("❌ User with this email already exists");
			return;
		}

		const phone = await question("Enter phone number: ");
		if (!validatePhone(phone)) {
			console.log("❌ Invalid phone number format");
			return;
		}

		const password = await hiddenQuestion("Enter password (min 8 characters): ");
		if (!validatePassword(password)) {
			console.log("❌ Password must be at least 8 characters long");
			return;
		}

		const confirmPassword = await hiddenQuestion("Confirm password: ");
		if (password !== confirmPassword) {
			console.log("❌ Passwords do not match");
			return;
		}

		console.log("\n📝 Creating admin user...");

		await createUser(email, password, name, phone, {
			role: "admin",
			status: "active",
		});

		console.log("✅ Admin user created successfully!");
		console.log(`📧 Email: ${email}`);
		console.log(`👤 Name: ${name}`);
		console.log(`🔐 Role: admin`);
	} catch (error) {
		console.error(
			"❌ Error creating admin user:",
			error instanceof Error ? error.message : "Unknown error",
		);
	}
}

async function promoteUserToAdmin(): Promise<void> {
	console.log("\n⬆️  Promote User to Admin");
	console.log("==========================");

	try {
		const emailOrPhone = await question("Enter user email or phone: ");

		const users = await getUserByEmailOrPhone(emailOrPhone);
		if (users.length === 0) {
			console.log("❌ User not found");
			return;
		}

		const user = users[0];
		console.log(`\n👤 Found user: ${user.name} (${user.email})`);
		console.log(`📊 Current role: ${user.role}`);
		console.log(`📈 Current status: ${user.status}`);

		if (user.role === "admin") {
			console.log("ℹ️  User is already an admin");
			return;
		}

		const confirm = await question("\nPromote this user to admin? (y/N): ");
		if (confirm.toLowerCase() !== "y" && confirm.toLowerCase() !== "yes") {
			console.log("❌ Operation cancelled");
			return;
		}

		console.log("🔄 Updating user role...");

		await updateUser(user.id, {
			role: "admin",
			status: "active",
		});

		console.log("✅ User promoted to admin successfully!");
		console.log(`👤 ${user.name} is now an admin`);
	} catch (error) {
		console.error(
			"❌ Error promoting user:",
			error instanceof Error ? error.message : "Unknown error",
		);
	}
}

async function resetAdminPassword(): Promise<void> {
	console.log("\n🔑 Reset Admin Password");
	console.log("=======================");

	try {
		const emailOrPhone = await question("Enter admin email or phone: ");

		const users = await getUserByEmailOrPhone(emailOrPhone);
		if (users.length === 0) {
			console.log("❌ User not found");
			return;
		}

		const user = users[0];
		console.log(`\n👤 Found user: ${user.name} (${user.email})`);
		console.log(`📊 Current role: ${user.role}`);

		if (user.role !== "admin") {
			console.log("❌ User is not an admin");
			return;
		}

		const newPassword = await hiddenQuestion("Enter new password (min 8 characters): ");
		if (!validatePassword(newPassword)) {
			console.log("❌ Password must be at least 8 characters long");
			return;
		}

		const confirmPassword = await hiddenQuestion("Confirm new password: ");
		if (newPassword !== confirmPassword) {
			console.log("❌ Passwords do not match");
			return;
		}

		console.log("\n🔄 Updating password...");

		await updateUser(user.id, {
			password: newPassword,
		});

		console.log("✅ Admin password reset successfully!");
		console.log(`👤 Password updated for: ${user.name}`);
	} catch (error) {
		console.error(
			"❌ Error resetting password:",
			error instanceof Error ? error.message : "Unknown error",
		);
	}
}

async function listAdmins(): Promise<void> {
	console.log("\n👥 Current Admin Users");
	console.log("======================");

	try {
		const admins = await getUsersByRole("admin");

		if (admins.length === 0) {
			console.log("ℹ️  No admin users found");
			return;
		}

		console.log(`Found ${admins.length} admin user(s):\n`);

		admins.forEach((admin, index) => {
			console.log(`${index + 1}. ${admin.name}`);
			console.log(`   📧 Email: ${admin.email}`);
			console.log(`   📱 Phone: ${admin.phone}`);
			console.log(`   📈 Status: ${admin.status}`);
			console.log(`   📅 Created: ${admin.created_at.toLocaleDateString()}`);
			console.log("");
		});
	} catch (error) {
		console.error(
			"❌ Error listing admins:",
			error instanceof Error ? error.message : "Unknown error",
		);
	}
}

async function updateAdminDetails(): Promise<void> {
	console.log("\n✏️  Update Admin Details");
	console.log("=========================");

	try {
		const emailOrPhone = await question("Enter admin email or phone: ");

		const users = await getUserByEmailOrPhone(emailOrPhone);
		if (users.length === 0) {
			console.log("❌ User not found");
			return;
		}

		const user = users[0];
		console.log(`\n👤 Found user: ${user.name} (${user.email})`);

		if (user.role !== "admin") {
			console.log("❌ User is not an admin");
			return;
		}

		console.log("\nCurrent details:");
		console.log(`Name: ${user.name}`);
		console.log(`Email: ${user.email}`);
		console.log(`Phone: ${user.phone}`);
		console.log(`Status: ${user.status}`);

		const updates: any = {};

		const newName = await question("\nEnter new name (press Enter to keep current): ");
		if (newName.trim()) updates.name = newName.trim();

		const newEmail = await question("Enter new email (press Enter to keep current): ");
		if (newEmail.trim()) {
			if (!validateEmail(newEmail)) {
				console.log("❌ Invalid email format");
				return;
			}
			updates.email = newEmail.trim();
		}

		const newPhone = await question("Enter new phone (press Enter to keep current): ");
		if (newPhone.trim()) {
			if (!validatePhone(newPhone)) {
				console.log("❌ Invalid phone number format");
				return;
			}
			updates.phone = newPhone.trim();
		}

		const statusOptions = ["active", "inactive"];
		const newStatus = await question(
			`Enter new status [${statusOptions.join("/")}] (press Enter to keep current): `,
		);
		if (newStatus.trim() && statusOptions.includes(newStatus.trim().toLowerCase())) {
			updates.status = newStatus.trim().toLowerCase() as "active" | "inactive";
		}

		if (Object.keys(updates).length === 0) {
			console.log("ℹ️  No changes made");
			return;
		}

		console.log("\n🔄 Updating admin details...");

		await updateUser(user.id, updates);

		console.log("✅ Admin details updated successfully!");
	} catch (error) {
		console.error(
			"❌ Error updating admin details:",
			error instanceof Error ? error.message : "Unknown error",
		);
	}
}

async function showMenu(): Promise<void> {
	console.log("\n🔐 Admin Management Console");
	console.log("============================");
	console.log("1. Create new admin user");
	console.log("2. Promote existing user to admin");
	console.log("3. Reset admin password");
	console.log("4. Update admin details");
	console.log("5. List all admin users");
	console.log("6. Exit");
	console.log("");

	const choice = await question("Select an option (1-6): ");

	switch (choice) {
		case "1":
			await createAdminUser();
			break;
		case "2":
			await promoteUserToAdmin();
			break;
		case "3":
			await resetAdminPassword();
			break;
		case "4":
			await updateAdminDetails();
			break;
		case "5":
			await listAdmins();
			break;
		case "6":
			console.log("👋 Goodbye!");
			rl.close();
			process.exit(0);
			break;
		default:
			console.log("❌ Invalid option. Please try again.");
	}

	await question("\nPress Enter to continue...");
	await showMenu();
}

async function main(): Promise<void> {
	console.log("🚀 Starting Admin Management Console...");
	console.log("⚠️  Make sure your database connection is configured properly.");

	try {
		console.log("✅ Database connection verified");
		await showMenu();
	} catch (error) {
		console.error(
			"❌ Failed to connect to database:",
			error instanceof Error ? error.message : "Unknown error",
		);
		console.error("Please check your database configuration and try again.");
		process.exit(1);
	}
}

// Handle cleanup
process.on("SIGINT", () => {
	console.log("\n👋 Goodbye!");
	rl.close();
	process.exit(0);
});

// Run the script
main().catch(console.error);
