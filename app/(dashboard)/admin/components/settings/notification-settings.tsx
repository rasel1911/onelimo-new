import { Bell, Mail, MessageSquare } from "lucide-react";
import { UseFormReturn } from "react-hook-form";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

import { SettingsFormData } from "../../settings/validation";

interface NotificationSettingsProps {
	form: UseFormReturn<SettingsFormData>;
	isLoading: boolean;
}

export const NotificationSettingsSection = ({ form, isLoading }: NotificationSettingsProps) => {
	return (
		<div className="grid gap-6 md:grid-cols-2">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<MessageSquare className="size-5" />
						Communication Channels
					</CardTitle>
					<CardDescription>Enable or disable notification delivery methods</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<FormField
						control={form.control}
						name="notifications.emailEnabled"
						render={({ field }) => (
							<FormItem className="flex items-center justify-between">
								<div className="space-y-0.5">
									<FormLabel>Email Notifications</FormLabel>
									<FormDescription>Send notifications via email</FormDescription>
								</div>
								<FormControl>
									<Switch
										checked={field.value}
										onCheckedChange={field.onChange}
										disabled={isLoading}
									/>
								</FormControl>
							</FormItem>
						)}
					/>

					<Separator />

					<FormField
						control={form.control}
						name="notifications.smsEnabled"
						render={({ field }) => (
							<FormItem className="flex items-center justify-between">
								<div className="space-y-0.5">
									<FormLabel>SMS Notifications</FormLabel>
									<FormDescription>Send notifications via SMS/text messages</FormDescription>
								</div>
								<FormControl>
									<Switch
										checked={field.value}
										onCheckedChange={field.onChange}
										disabled={isLoading}
									/>
								</FormControl>
							</FormItem>
						)}
					/>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Bell className="size-5" />
						Notification Recipients
					</CardTitle>
					<CardDescription>Configure who receives notifications</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<FormField
						control={form.control}
						name="notifications.customerNotificationsEnabled"
						render={({ field }) => (
							<FormItem className="flex items-center justify-between">
								<div className="space-y-0.5">
									<FormLabel>Customer Notifications</FormLabel>
									<FormDescription>Booking updates and confirmations</FormDescription>
								</div>
								<FormControl>
									<Switch
										checked={field.value}
										onCheckedChange={field.onChange}
										disabled={isLoading}
									/>
								</FormControl>
							</FormItem>
						)}
					/>

					<Separator />

					<FormField
						control={form.control}
						name="notifications.providerNotificationsEnabled"
						render={({ field }) => (
							<FormItem className="flex items-center justify-between">
								<div className="space-y-0.5">
									<FormLabel>Provider Notifications</FormLabel>
									<FormDescription>New booking requests and updates</FormDescription>
								</div>
								<FormControl>
									<Switch
										checked={field.value}
										onCheckedChange={field.onChange}
										disabled={isLoading}
									/>
								</FormControl>
							</FormItem>
						)}
					/>

					<Separator />

					<FormField
						control={form.control}
						name="notifications.adminAlertsEnabled"
						render={({ field }) => (
							<FormItem className="flex items-center justify-between">
								<div className="space-y-0.5">
									<FormLabel>Admin Alerts</FormLabel>
									<FormDescription>System alerts and error notifications</FormDescription>
								</div>
								<FormControl>
									<Switch
										checked={field.value}
										onCheckedChange={field.onChange}
										disabled={isLoading}
									/>
								</FormControl>
							</FormItem>
						)}
					/>
				</CardContent>
			</Card>
		</div>
	);
};
