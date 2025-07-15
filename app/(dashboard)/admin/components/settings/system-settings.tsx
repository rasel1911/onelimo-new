import { Database, HardDrive, Settings, BarChart3 } from "lucide-react";
import { UseFormReturn } from "react-hook-form";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

import { SettingsFormData } from "../../settings/validation";

interface SystemSettingsProps {
	form: UseFormReturn<SettingsFormData>;
	isLoading: boolean;
}

export const SystemSettingsSection = ({ form, isLoading }: SystemSettingsProps) => {
	return (
		<div className="grid gap-6 md:grid-cols-2">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Settings className="size-5" />
						System Operations
					</CardTitle>
					<CardDescription>Configure system-wide operational settings</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<FormField
						control={form.control}
						name="system.maintenanceMode"
						render={({ field }) => (
							<FormItem className="flex items-center justify-between">
								<div className="space-y-0.5">
									<FormLabel>Maintenance Mode</FormLabel>
									<FormDescription>Temporarily disable the system for maintenance</FormDescription>
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
						name="system.debugMode"
						render={({ field }) => (
							<FormItem className="flex items-center justify-between">
								<div className="space-y-0.5">
									<FormLabel>Debug Mode</FormLabel>
									<FormDescription>Enable detailed logging for troubleshooting</FormDescription>
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

					<FormField
						control={form.control}
						name="system.logLevel"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Log Level</FormLabel>
								<Select
									onValueChange={field.onChange}
									defaultValue={field.value}
									disabled={isLoading}
								>
									<FormControl>
										<SelectTrigger>
											<SelectValue placeholder="Select log level" />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										<SelectItem value="error">Error</SelectItem>
										<SelectItem value="warn">Warning</SelectItem>
										<SelectItem value="info">Info</SelectItem>
										<SelectItem value="debug">Debug</SelectItem>
										<SelectItem value="trace">Trace</SelectItem>
									</SelectContent>
								</Select>
								<FormDescription>Set the minimum level for system logging</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<HardDrive className="size-5" />
						Data Management
					</CardTitle>
					<CardDescription>Configure data retention and backup settings</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<FormField
						control={form.control}
						name="system.dataRetentionDays"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Data Retention Period (days)</FormLabel>
								<FormControl>
									<Input
										type="number"
										min="30"
										max="2555"
										disabled={isLoading}
										{...field}
										onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
									/>
								</FormControl>
								<FormDescription>
									How long to keep system data before automatic deletion (30-2555 days)
								</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="system.backupEnabled"
						render={({ field }) => (
							<FormItem className="flex items-center justify-between">
								<div className="space-y-0.5">
									<FormLabel>Automatic Backups</FormLabel>
									<FormDescription>Enable scheduled system backups</FormDescription>
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
						name="system.analyticsEnabled"
						render={({ field }) => (
							<FormItem className="flex items-center justify-between">
								<div className="space-y-0.5">
									<FormLabel>Analytics Collection</FormLabel>
									<FormDescription>Collect system usage analytics</FormDescription>
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
