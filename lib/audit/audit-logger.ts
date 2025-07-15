import { auditLogSchema } from "@/app/(dashboard)/admin/admin-schemas";

export interface AuditLogEntry {
	action: string;
	resource: string;
	resourceId?: string;
	userId: string;
	userEmail?: string;
	userName?: string;
	ipAddress?: string;
	userAgent?: string;
	details?: Record<string, any>;
	timestamp: Date;
	severity: "low" | "medium" | "high" | "critical";
}

interface AuditContext {
	userId: string;
	userEmail?: string;
	userName?: string;
	ipAddress?: string;
	userAgent?: string;
}

/**
 * Audit logger for tracking admin actions and security events
 */
class AuditLogger {
	private logs: AuditLogEntry[] = [];

	/**
	 * Log an admin action
	 */
	async logAction(
		action: string,
		resource: string,
		context: AuditContext,
		options: {
			resourceId?: string;
			details?: Record<string, any>;
			severity?: AuditLogEntry["severity"];
		} = {},
	): Promise<void> {
		const entry: AuditLogEntry = {
			action,
			resource,
			resourceId: options.resourceId,
			userId: context.userId,
			userEmail: context.userEmail,
			userName: context.userName,
			ipAddress: context.ipAddress,
			userAgent: context.userAgent,
			details: options.details,
			timestamp: new Date(),
			severity: options.severity || this.determineSeverity(action, resource),
		};

		try {
			auditLogSchema.parse({
				action: entry.action,
				resource: entry.resource,
				resourceId: entry.resourceId,
				userId: entry.userId,
				details: entry.details,
				timestamp: entry.timestamp,
			});
		} catch (error) {
			console.error("Invalid audit log entry:", error);
			return;
		}

		// Store the log entry (in production, this would go to a database)
		this.logs.push(entry);

		// Log to console for immediate visibility
		console.log(
			`[AUDIT] ${entry.severity.toUpperCase()}: ${action} on ${resource} by ${context.userEmail || context.userId}`,
			{
				...entry,
				details: this.sanitizeDetails(entry.details),
			},
		);

		// For critical actions, send alerts
		if (entry.severity === "critical") {
			await this.sendCriticalAlert(entry);
		}
	}

	/**
	 * Log data access events
	 */
	async logDataAccess(
		resource: string,
		action: "read" | "export" | "search",
		context: AuditContext,
		options: {
			resourceId?: string;
			recordCount?: number;
			filters?: Record<string, any>;
		} = {},
	): Promise<void> {
		await this.logAction(`data_${action}`, resource, context, {
			resourceId: options.resourceId,
			details: {
				recordCount: options.recordCount,
				filters: options.filters,
			},
			severity: action === "export" ? "medium" : "low",
		});
	}

	/**
	 * Log configuration changes
	 */
	async logConfigChange(
		setting: string,
		context: AuditContext,
		options: {
			oldValue?: any;
			newValue?: any;
		} = {},
	): Promise<void> {
		await this.logAction("config_update", "settings", context, {
			resourceId: setting,
			details: {
				setting,
				oldValue: this.sanitizeValue(options.oldValue),
				newValue: this.sanitizeValue(options.newValue),
			},
			severity: "high",
		});
	}

	/**
	 * Determine severity based on action and resource
	 */
	private determineSeverity(action: string, resource: string): AuditLogEntry["severity"] {
		if (action.includes("delete") || action.includes("role_change") || resource === "security") {
			return "critical";
		}

		if (action.includes("create") || action.includes("update") || action.includes("config")) {
			return "high";
		}

		if (action.includes("export") || action.includes("user_")) {
			return "medium";
		}

		return "low";
	}

	/**
	 * Sanitize sensitive details for logging
	 */
	private sanitizeDetails(details?: Record<string, any>): Record<string, any> | undefined {
		if (!details) return undefined;

		const sanitized = { ...details };
		const sensitiveKeys = ["password", "token", "secret", "key", "credential"];

		for (const key of Object.keys(sanitized)) {
			if (sensitiveKeys.some((sensitive) => key.toLowerCase().includes(sensitive))) {
				sanitized[key] = "[REDACTED]";
			}
		}

		return sanitized;
	}

	/**
	 * Sanitize sensitive values
	 */
	private sanitizeValue(value: any): any {
		if (typeof value === "string" && value.length > 50) {
			return value.substring(0, 50) + "... [TRUNCATED]";
		}
		return value;
	}

	/**
	 * Send critical alerts (implement based on your notification system)
	 */
	private async sendCriticalAlert(entry: AuditLogEntry): Promise<void> {
		// FIXME: In production, send this to your monitoring system
		console.error(`[CRITICAL AUDIT ALERT] ${entry.action} on ${entry.resource}`, entry);
	}
}

export const auditLogger = new AuditLogger();

/**
 * Helper function to create audit context from request
 */
export const createAuditContext = (
	userId: string,
	request?: Request,
	user?: { email?: string; name?: string },
): AuditContext => {
	const ipAddress =
		request?.headers.get("x-forwarded-for")?.split(",")[0] ||
		request?.headers.get("x-real-ip") ||
		"unknown";

	const userAgent = request?.headers.get("user-agent") || "unknown";

	return {
		userId,
		userEmail: user?.email,
		userName: user?.name,
		ipAddress,
		userAgent,
	};
};
