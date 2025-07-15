import { Clock, Users } from "lucide-react";
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

import { SettingsFormData } from "../../settings/validation";

interface WorkflowSettingsProps {
	form: UseFormReturn<SettingsFormData>;
	isLoading: boolean;
}

export const WorkflowSettingsSection = ({ form, isLoading }: WorkflowSettingsProps) => {
	return (
		<div className="grid gap-6 md:grid-cols-2">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Clock className="size-5" />
						Timing Configuration
					</CardTitle>
					<CardDescription>
						Configure timeouts and intervals for workflow operations
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<FormField
						control={form.control}
						name="workflow.responseTimeoutMinutes"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Provider Response Timeout (minutes)</FormLabel>
								<FormControl>
									<Input
										disabled={isLoading}
										{...field}
										onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
									/>
								</FormControl>
								<FormDescription>How long to wait for initial provider responses</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="workflow.responseCheckIntervalMinutes"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Response Check Interval (minutes)</FormLabel>
								<FormControl>
									<Input
										disabled={isLoading}
										{...field}
										onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
									/>
								</FormControl>
								<FormDescription>How often to check for provider responses</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="workflow.minResponsesRequired"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Minimum Responses Required</FormLabel>
								<FormControl>
									<Input
										disabled={isLoading}
										{...field}
										onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
									/>
								</FormControl>
								<FormDescription>
									Minimum number of provider responses required before proceeding
								</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Users className="size-5" />
						Provider Management
					</CardTitle>
					<CardDescription>
						Configure how many providers to contact and retry behavior
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<FormField
						control={form.control}
						name="workflow.minProvidersToContact"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Minimum Providers to Contact</FormLabel>
								<FormControl>
									<Input
										disabled={isLoading}
										{...field}
										onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
									/>
								</FormControl>
								<FormDescription>Minimum number of providers to contact initially</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="workflow.maxProvidersToContact"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Maximum Providers to Contact</FormLabel>
								<FormControl>
									<Input
										disabled={isLoading}
										{...field}
										onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
									/>
								</FormControl>
								<FormDescription>Maximum number of providers to contact initially</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="workflow.retryAttempts"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Retry Attempts</FormLabel>
								<FormControl>
									<Input
										disabled={isLoading}
										{...field}
										onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
									/>
								</FormControl>
								<FormDescription>Number of times to retry failed operations</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>
				</CardContent>
			</Card>
		</div>
	);
};
