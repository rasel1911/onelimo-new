"use client";

import { Mail, Phone, User } from "lucide-react";

import { ScrollArea } from "@/components/ui/scroll-area";
import { TabsContent } from "@/components/ui/tabs";
import { NOTIFICATION_TYPES } from "@/lib/workflow/constants/notification";
import { ProviderNotification } from "@/lib/workflow/types/notification";

import { NotificationSkeleton } from "./notification-skeleton";
import { ProviderNotificationCard } from "./provider-notification-card";
import { ProviderProfileCard } from "./provider-profile-card";

interface NotificationTabsContentProps {
	providerDetails: ProviderNotification[];
	isLoading: boolean;
}

const EmptyState = ({
	icon: Icon,
	title,
	description,
}: {
	icon: any;
	title: string;
	description?: string;
}) => (
	<div className="flex flex-col items-center justify-center py-12 text-center">
		<Icon className="mb-4 size-12 text-muted-foreground" />
		<p className="text-muted-foreground">{title}</p>
		{description && <p className="mt-2 text-sm text-muted-foreground">{description}</p>}
	</div>
);

export function NotificationTabsContent({
	providerDetails,
	isLoading,
}: NotificationTabsContentProps) {
	const emailNotifications = providerDetails.filter(
		(p) => p.notification.type === NOTIFICATION_TYPES.EMAIL,
	);
	const smsNotifications = providerDetails.filter(
		(p) => p.notification.type === NOTIFICATION_TYPES.SMS,
	);

	// Get unique providers
	const providers = providerDetails
		.filter((p) => p.provider)
		.reduce((acc, current) => {
			if (!acc.find((p) => p.provider?.id === current.provider?.id)) {
				acc.push(current);
			}
			return acc;
		}, [] as ProviderNotification[])
		.map((p) => p.provider)
		.filter(Boolean);

	return (
		<>
			{/* Providers Tab */}
			<TabsContent value="providers" className="mt-4">
				<ScrollArea className="h-[400px] w-full">
					{isLoading ? (
						<NotificationSkeleton />
					) : providers.length > 0 ? (
						<div className="space-y-4">
							{providers.map((provider, index) =>
								provider ? (
									<ProviderProfileCard
										key={`provider-${provider.id}-${index}`}
										provider={provider}
									/>
								) : null,
							)}
						</div>
					) : (
						<EmptyState icon={User} title="No provider data available" />
					)}
				</ScrollArea>
			</TabsContent>

			{/* All Notifications Tab */}
			<TabsContent value="notifications" className="mt-4">
				<ScrollArea className="h-[400px] w-full">
					{isLoading ? (
						<NotificationSkeleton />
					) : providerDetails.length > 0 ? (
						<div className="space-y-3">
							{providerDetails.map((item, index) => (
								<ProviderNotificationCard
									key={`${item.notification.id}-${index}`}
									notification={item.notification}
									provider={item.provider}
								/>
							))}
						</div>
					) : (
						<EmptyState
							icon={User}
							title="No notification data available"
							description="Notification details will appear here once providers are contacted."
						/>
					)}
				</ScrollArea>
			</TabsContent>

			{/* Email Tab */}
			<TabsContent value="email" className="mt-4">
				<ScrollArea className="h-[400px] w-full">
					{isLoading ? (
						<NotificationSkeleton />
					) : emailNotifications.length > 0 ? (
						<div className="space-y-3">
							{emailNotifications.map((item, index) => (
								<ProviderNotificationCard
									key={`email-${item.notification.id}-${index}`}
									notification={item.notification}
									provider={item.provider}
								/>
							))}
						</div>
					) : (
						<EmptyState icon={Mail} title="No email notifications sent" />
					)}
				</ScrollArea>
			</TabsContent>

			{/* SMS Tab */}
			<TabsContent value="sms" className="mt-4">
				<ScrollArea className="h-[400px] w-full">
					{isLoading ? (
						<NotificationSkeleton />
					) : smsNotifications.length > 0 ? (
						<div className="space-y-3">
							{smsNotifications.map((item, index) => (
								<ProviderNotificationCard
									key={`sms-${item.notification.id}-${index}`}
									notification={item.notification}
									provider={item.provider}
								/>
							))}
						</div>
					) : (
						<EmptyState icon={Phone} title="No SMS notifications sent" />
					)}
				</ScrollArea>
			</TabsContent>
		</>
	);
}
