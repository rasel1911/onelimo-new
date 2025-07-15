import { Shield, Timer, UserX } from "lucide-react";
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

interface SecuritySettingsProps {
	form: UseFormReturn<SettingsFormData>;
	isLoading: boolean;
}

export const SecuritySettingsSection = ({ form, isLoading }: SecuritySettingsProps) => {
	return (
		<div className="grid gap-6 md:grid-cols-2">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Timer className="size-5" />
						Session Management
					</CardTitle>
					<CardDescription>Configure user session security settings</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<FormField
						control={form.control}
						name="security.sessionTimeoutMinutes"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Session Timeout (minutes)</FormLabel>
								<FormControl>
									<Input
										type="number"
										min="15"
										max="1440"
										disabled={isLoading}
										{...field}
										onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
									/>
								</FormControl>
								<FormDescription>
									How long users can stay logged in without activity (15-1440 minutes)
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
						<UserX className="size-5" />
						Authentication Security
					</CardTitle>
					<CardDescription>Configure login security and access controls</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<FormField
						control={form.control}
						name="security.maxLoginAttempts"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Maximum Login Attempts</FormLabel>
								<FormControl>
									<Input
										type="number"
										min="3"
										max="20"
										disabled={isLoading}
										{...field}
										onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
									/>
								</FormControl>
								<FormDescription>
									Number of failed login attempts before account lockout (3-20 attempts)
								</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>
				</CardContent>
			</Card>
		</div>
	);
};
