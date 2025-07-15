"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Settings, Shield, Activity, Bell, Database, Save, RotateCcw } from "lucide-react";
import { Suspense, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { SettingsSkeleton } from "@/app/(dashboard)/admin/components/settings/settings-skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { settingsFormSchema, SettingsFormData } from "./validation";
import {
	WorkflowSettingsSection,
	NotificationSettingsSection,
	SecuritySettingsSection,
	SystemSettingsSection,
} from "../components/settings";

const SettingsPage = () => {
	const [isLoading, setIsLoading] = useState(true);
	const [showStaticFirst, setShowStaticFirst] = useState(true);
	const [lastSaved, setLastSaved] = useState<Date | null>(null);

	const form = useForm<SettingsFormData>({
		resolver: zodResolver(settingsFormSchema),
		defaultValues: {
			workflow: {
				responseTimeoutMinutes: 30,
				minProvidersToContact: 3,
				maxProvidersToContact: 5,
				retryAttempts: 3,

				responseCheckIntervalMinutes: 10,
				minResponsesRequired: 1,
			},
			notifications: {
				emailEnabled: true,
				smsEnabled: true,
				customerNotificationsEnabled: true,
				providerNotificationsEnabled: true,
				adminAlertsEnabled: true,
			},
			security: {
				sessionTimeoutMinutes: 60,
				maxLoginAttempts: 5,
			},
			system: {
				maintenanceMode: false,
				debugMode: false,
				logLevel: "info" as const,
				dataRetentionDays: 365,
				backupEnabled: true,
				analyticsEnabled: true,
			},
		},
	});

	const {
		handleSubmit,
		reset,
		formState: { isSubmitting },
	} = form;

	useEffect(() => {
		const loadSettings = async () => {
			try {
				const [response] = await Promise.all([
					fetch("/api/settings"),
					new Promise((resolve) => setTimeout(resolve, 800)),
				]);

				if (response.ok) {
					const data = await response.json();
					reset(data);
				} else {
					toast.error("Failed to load settings. Please try again.");
					throw new Error("Failed to load settings");
				}
			} catch (error) {
				console.error("Failed to load settings:", error);
				toast.error("Failed to load settings. Please try again.");
			} finally {
				setTimeout(() => {
					setIsLoading(false);
					setShowStaticFirst(false);
				}, 100);
			}
		};

		loadSettings();
	}, [reset]);

	const onSubmit = async (data: SettingsFormData) => {
		try {
			const response = await fetch("/api/settings", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(data),
			});

			const result = await response.json();

			if (response.ok) {
				reset(result);
				setLastSaved(new Date());
				toast.success("Settings saved successfully!");
			} else {
				if (result.fieldErrors) {
					Object.entries(result.fieldErrors).forEach(([field, messages]) => {
						const fieldPath = field.split(".") as any;
						form.setError(fieldPath.length === 1 ? fieldPath[0] : (fieldPath.join(".") as any), {
							type: "server",
							message: Array.isArray(messages) ? messages[0] : messages,
						});
					});
					toast.error("Please fix the validation errors and try again.");
				} else {
					toast.error(result.error || "Failed to save settings");
				}
			}
		} catch (error) {
			console.error("Failed to save settings:", error);
			toast.error("Failed to save settings. Please try again.");
		}
	};

	const handleReset = async () => {
		try {
			const response = await fetch("/api/settings/reset", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
			});

			if (response.ok) {
				const resetSettings = await response.json();
				reset(resetSettings);
				setLastSaved(new Date());
				toast.success("Settings reset to defaults successfully!");
			} else {
				const errorData = await response.json();
				toast.error(errorData.error || "Failed to reset settings");
			}
		} catch (error) {
			console.error("Failed to reset settings:", error);
			toast.error("Failed to reset settings. Please try again.");
		}
	};

	if (showStaticFirst) {
		return <SettingsSkeleton />;
	}

	return (
		<Suspense fallback={<SettingsSkeleton />}>
			<div className="flex-1 space-y-6 p-6">
				<Form {...form}>
					<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
						<div className="flex items-center justify-between">
							<div>
								<h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight">
									<Settings className="size-8" />
									System Settings
								</h1>
								<p className="mt-2 text-muted-foreground">
									Configure workflow parameters, notifications, security, and system preferences
								</p>
							</div>
							<div className="flex items-center gap-3">
								{lastSaved && (
									<motion.div
										initial={{ opacity: 0, scale: 0.8 }}
										animate={{ opacity: 1, scale: 1 }}
										transition={{ duration: 0.3 }}
									>
										<Badge variant="outline" className="text-xs">
											Last saved: {lastSaved.toLocaleTimeString()}
										</Badge>
									</motion.div>
								)}
								<Button
									type="button"
									variant="outline"
									onClick={handleReset}
									disabled={isSubmitting}
									className="flex items-center gap-2"
								>
									<RotateCcw className="size-4" />
									Reset to Defaults
								</Button>
								<Button type="submit" disabled={isSubmitting} className="flex items-center gap-2">
									<Save className="size-4" />
									{isSubmitting ? "Saving..." : "Save Changes"}
								</Button>
							</div>
						</div>

						<Alert>
							<Shield className="size-4" />
							<AlertDescription>
								Changes to these settings will affect the entire system. Please review carefully
								before saving.
							</AlertDescription>
						</Alert>

						<Tabs defaultValue="workflow" className="space-y-6">
							<TabsList className="grid w-full grid-cols-4">
								<TabsTrigger value="workflow" className="flex items-center gap-2">
									<Activity className="size-4" />
									Workflow
								</TabsTrigger>
								<TabsTrigger value="notifications" className="flex items-center gap-2">
									<Bell className="size-4" />
									Notifications
								</TabsTrigger>
								<TabsTrigger value="security" className="flex items-center gap-2">
									<Shield className="size-4" />
									Security
								</TabsTrigger>
								<TabsTrigger value="system" className="flex items-center gap-2">
									<Database className="size-4" />
									System
								</TabsTrigger>
							</TabsList>

							<TabsContent value="workflow" className="space-y-6">
								<motion.div
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.4 }}
								>
									<WorkflowSettingsSection form={form} isLoading={isLoading} />
								</motion.div>
							</TabsContent>

							<TabsContent value="notifications" className="space-y-6">
								<motion.div
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.4 }}
								>
									<NotificationSettingsSection form={form} isLoading={isLoading} />
								</motion.div>
							</TabsContent>

							<TabsContent value="security" className="space-y-6">
								<motion.div
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.4 }}
								>
									<SecuritySettingsSection form={form} isLoading={isLoading} />
								</motion.div>
							</TabsContent>

							<TabsContent value="system" className="space-y-6">
								<motion.div
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.4 }}
								>
									<SystemSettingsSection form={form} isLoading={isLoading} />
								</motion.div>
							</TabsContent>
						</Tabs>
					</form>
				</Form>
			</div>
		</Suspense>
	);
};

export default SettingsPage;
