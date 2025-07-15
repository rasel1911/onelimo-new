import { NextRequest, NextResponse } from "next/server";

import { setSessionInResponse } from "@/lib/middleware/pin-auth";

export const POST = async (request: NextRequest) => {
	try {
		const response = NextResponse.json({
			success: true,
			message: "Logged out successfully",
		});

		setSessionInResponse(response, null);

		return response;
	} catch (error) {
		console.error("Logout error:", error);
		return NextResponse.json({ success: false, error: "Failed to logout" }, { status: 500 });
	}
};
