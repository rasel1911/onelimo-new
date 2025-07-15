"use client";

import { Mail, MessageSquare } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { ProviderNotification } from "@/lib/workflow/types/notification";
import {
	getStatusColor,
	getStatusIcon,
	formatDateTime,
} from "@/lib/workflow/utils/notification-utils";

interface ProviderNotificationCardProps {
	notification: ProviderNotification["notification"];
	provider: ProviderNotification["provider"];
}

export function ProviderNotificationCard({
	notification,
	provider,
}: ProviderNotificationCardProps) {
	const StatusIcon = getStatusIcon(notification.status);

	return (
		<div className="flex items-start space-x-3 rounded-lg border p-4 transition-all hover:border-muted-foreground/20">
			<div className="flex size-10 items-center justify-center rounded-full bg-muted">
				{notification.type === "email" ? (
					<Mail className="size-5 text-muted-foreground" />
				) : (
					<MessageSquare className="size-5 text-muted-foreground" />
				)}
			</div>

			<div className="flex-1 space-y-2">
				<div className="flex items-center justify-between">
					<div>
						<p className="font-medium">{provider?.name || "Unknown Provider"}</p>
						<p className="text-sm text-muted-foreground">
							{notification.type === "email" ? notification.recipient : provider?.phone || "N/A"}
						</p>
					</div>
					<Badge
						className={`${getStatusColor(notification.status)} text-white`}
						variant="secondary"
					>
						<StatusIcon className="size-4" />
						<span className="ml-1 capitalize">{notification.status}</span>
					</Badge>
				</div>

				{notification.sentAt && (
					<p className="text-xs text-muted-foreground">
						Sent {formatDateTime(notification.sentAt)}
					</p>
				)}

				{notification.errorMessage && (
					<div className="rounded-md bg-red-50 px-2 py-1 text-xs text-red-700 dark:bg-red-950/20 dark:text-red-400">
						{notification.errorMessage}
					</div>
				)}

				<div className="flex items-center gap-2">
					{notification.templateUsed && (
						<Badge variant="outline" className="text-xs">
							{notification.templateUsed}
						</Badge>
					)}
					{notification.retryCount && notification.retryCount > 0 && (
						<Badge variant="secondary" className="text-xs">
							Retry: {notification.retryCount}
						</Badge>
					)}
					{notification.hasResponse && (
						<Badge variant="default" className="text-xs">
							Responded
						</Badge>
					)}
				</div>
			</div>
		</div>
	);
}
