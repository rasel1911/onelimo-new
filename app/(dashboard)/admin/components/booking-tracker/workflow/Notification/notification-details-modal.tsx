"use client";

import { Mail, Loader2, RefreshCw, AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNotificationDetails } from "@/hooks/use-notification-details";
import { NotificationDetailsModalProps } from "@/lib/workflow/types/notification";

import { NotificationSummaryCards } from "./notification-summary-cards";
import { NotificationTabsContent } from "./notification-tabs-content";

export function NotificationDetailsModal({
	isOpen,
	onCloseAction,
	data,
}: NotificationDetailsModalProps) {
	const { providerDetails, isLoading, error, refetch } = useNotificationDetails(
		data?.workflowRunId,
		isOpen,
	);

	const providersCount = providerDetails
		.filter((p) => p.provider)
		.reduce(
			(acc, current) => {
				if (!acc.find((p) => p.provider?.id === current.provider?.id)) {
					acc.push(current);
				}
				return acc;
			},
			[] as typeof providerDetails,
		).length;

	const emailNotifications = providerDetails.filter((p) => p.notification.type === "email");
	const smsNotifications = providerDetails.filter((p) => p.notification.type === "sms");

	return (
		<Dialog open={isOpen} onOpenChange={onCloseAction}>
			<DialogContent className="max-h-[90vh] max-w-4xl">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Mail className="size-5" />
						Notification Details
					</DialogTitle>
					<DialogDescription>
						Status and details of notifications sent to service providers
					</DialogDescription>
				</DialogHeader>

				{/* Summary Cards */}
				<NotificationSummaryCards
					notifications={providerDetails}
					notificationSummary={data?.notificationSummary}
				/>

				{/* Provider Details */}
				<div className="flex-1">
					<div className="mb-4 flex items-center justify-between">
						<h3 className="text-lg font-semibold">Provider Notifications</h3>
						<Button variant="outline" size="sm" onClick={refetch} disabled={isLoading}>
							{isLoading ? (
								<Loader2 className="size-4 animate-spin" />
							) : (
								<RefreshCw className="size-4" />
							)}
							<span className="ml-2">Refresh</span>
						</Button>
					</div>

					{/* Error State */}
					{error && (
						<div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-950/20">
							<div className="flex items-center gap-2 text-sm text-red-700 dark:text-red-400">
								<AlertTriangle className="size-4" />
								{error}
							</div>
						</div>
					)}

					{/* Tabs */}
					<Tabs defaultValue="providers" className="w-full">
						<TabsList className="grid w-full grid-cols-4">
							<TabsTrigger value="providers">Providers ({providersCount})</TabsTrigger>
							<TabsTrigger value="notifications">
								All Notifications ({providerDetails.length})
							</TabsTrigger>
							<TabsTrigger value="email">Email ({emailNotifications.length})</TabsTrigger>
							<TabsTrigger value="sms">SMS ({smsNotifications.length})</TabsTrigger>
						</TabsList>

						<NotificationTabsContent providerDetails={providerDetails} isLoading={isLoading} />
					</Tabs>
				</div>
			</DialogContent>
		</Dialog>
	);
}
