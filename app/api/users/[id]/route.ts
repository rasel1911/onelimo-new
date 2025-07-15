import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/app/(auth)/auth";
import { getUserById } from "@/db/queries/user.queries";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		if (session.user.id !== params.id) {
			return NextResponse.json({ error: "Forbidden" }, { status: 403 });
		}

		const users = await getUserById(params.id);

		if (users.length === 0) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		const user = users[0];

		const { password, ...userWithoutPassword } = user;

		return NextResponse.json(userWithoutPassword);
	} catch (error) {
		console.error("Error fetching user data:", error);
		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}
