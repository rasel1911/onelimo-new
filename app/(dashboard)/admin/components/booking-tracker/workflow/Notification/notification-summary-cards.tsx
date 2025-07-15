"use client";

import { Mail, MessageSquare } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { NOTIFICATION_TYPES, SUCCESS_STATUSES } from "@/lib/workflow/constants/notification";
import { ResponseSummary, ProviderNotification } from "@/lib/workflow/types/notification";
import { calculateSuccessRate } from "@/lib/workflow/utils/notification-utils";

interface NotificationSummaryCardsProps {
	notifications: ProviderNotification[];
	notificationSummary?: ResponseSummary;
}

export function NotificationSummaryCards({
	notifications,
	notificationSummary,
}: NotificationSummaryCardsProps) {
	const emailNotifications = notifications.filter(
		(p) => p.notification.type === NOTIFICATION_TYPES.EMAIL,
	);
	const smsNotifications = notifications.filter(
		(p) => p.notification.type === NOTIFICATION_TYPES.SMS,
	);

	const emailSuccess = emailNotifications.filter((p) =>
		SUCCESS_STATUSES.includes(p.notification.status.toLowerCase() as any),
	).length;
	const smsSuccess = smsNotifications.filter((p) =>
		SUCCESS_STATUSES.includes(p.notification.status.toLowerCase() as any),
	).length;

	const emailProgress = calculateSuccessRate(emailSuccess, emailNotifications.length);
	const smsProgress = calculateSuccessRate(smsSuccess, smsNotifications.length);

	return (
		<div className="grid grid-cols-2 gap-4">
			{/* Email Notifications Card */}
			<div className="rounded-lg border p-4">
				<div className="mb-3 flex items-center justify-between">
					<div className="flex items-center gap-2">
						<Mail className="size-5 text-blue-500" />
						<h3 className="font-semibold">Email Notifications</h3>
					</div>
					<Badge
						variant={notificationSummary?.email?.status === "sent" ? "default" : "destructive"}
					>
						{notificationSummary?.email?.status || "unknown"}
					</Badge>
				</div>

				<div className="space-y-2">
					<div className="flex justify-between text-sm">
						<span>Success Rate</span>
						<span className="font-medium">{emailProgress}%</span>
					</div>
					<Progress value={emailProgress} className="h-2" />
					<div className="flex justify-between text-xs text-muted-foreground">
						<span>{emailSuccess} sent</span>
						<span>{emailNotifications.length} total</span>
					</div>
				</div>
			</div>

			{/* SMS Notifications Card */}
			<div className="rounded-lg border p-4">
				<div className="mb-3 flex items-center justify-between">
					<div className="flex items-center gap-2">
						<MessageSquare className="size-5 text-green-500" />
						<h3 className="font-semibold">SMS Notifications</h3>
					</div>
					<Badge variant={notificationSummary?.sms?.status === "sent" ? "default" : "outline"}>
						{notificationSummary?.sms?.status || "unknown"}
					</Badge>
				</div>

				<div className="space-y-2">
					<div className="flex justify-between text-sm">
						<span>Success Rate</span>
						<span className="font-medium">{smsProgress}%</span>
					</div>
					<Progress value={smsProgress} className="h-2" />
					<div className="flex justify-between text-xs text-muted-foreground">
						<span>{smsSuccess} sent</span>
						<span>{smsNotifications.length} total</span>
					</div>
				</div>
			</div>
		</div>
	);
}
