import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/app/(auth)/auth";
import { bookingQuerySchema, validateAdminRequest } from "@/app/(dashboard)/admin/admin-schemas";
import { getAllBookingRequestsWithStatus } from "@/db/queries/bookingRequest.queries";
import { isUserAdmin } from "@/db/queries/user.queries";
import { auditLogger, createAuditContext } from "@/lib/audit/audit-logger";
import { adminRateLimiter } from "@/lib/middleware/rate-limit";

export const GET = async (request: NextRequest) => {
	try {
		const rateLimitResult = await adminRateLimiter(request);
		if (!rateLimitResult.isAllowed) {
			return rateLimitResult.response!;
		}

		const session = await auth();
		if (!session?.user?.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const isAdmin = await isUserAdmin(session.user.id);
		if (!isAdmin) {
			return NextResponse.json({ error: "Admin access required" }, { status: 403 });
		}

		const { searchParams } = new URL(request.url);
		const queryParams = {
			page: searchParams.get("page"),
			limit: searchParams.get("limit"),
			status: searchParams.get("status") || undefined,
			dateFrom: searchParams.get("dateFrom") || undefined,
			dateTo: searchParams.get("dateTo") || undefined,
			search: searchParams.get("search") || undefined,
			sortBy: searchParams.get("sortBy") || undefined,
			sortOrder: searchParams.get("sortOrder") || undefined,
		};

		const validationResult = validateAdminRequest(bookingQuerySchema, queryParams);

		if (!validationResult.success) {
			return NextResponse.json(
				{ error: "Invalid parameters", details: validationResult.error.errors },
				{ status: 400 },
			);
		}

		const { page, limit, status, dateFrom, dateTo, search, sortBy, sortOrder } =
			validationResult.data;

		const auditContext = createAuditContext(session.user.id, request, {
			email: session.user.email || undefined,
			name: session.user.name || undefined,
		});
		await auditLogger.logDataAccess("bookings", "read", auditContext, {
			recordCount: limit,
			filters: { status, dateFrom, dateTo, search, sortBy, sortOrder },
		});

		const result = await getAllBookingRequestsWithStatus({ page, limit });
		return NextResponse.json(result);
	} catch (error) {
		console.error("Error fetching bookings:", error);
		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
};
