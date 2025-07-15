"use client";

import { motion } from "framer-motion";
import { Settings, Shield, Activity, Bell, Database, Save, RotateCcw } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const LoadingInput = () => {
	return (
		<div className="space-y-2">
			<Skeleton className="h-4 w-1/3" />
			<Skeleton className="h-9 w-full" />
			<Skeleton className="h-3 w-3/4" />
		</div>
	);
};

const LoadingSwitch = () => {
	return (
		<div className="flex items-center justify-between">
			<div className="space-y-1">
				<Skeleton className="h-4 w-32" />
				<Skeleton className="h-3 w-48" />
			</div>
			<Skeleton className="h-6 w-11 rounded-full" />
		</div>
	);
};

const LoadingSelect = () => {
	return (
		<div className="space-y-2">
			<Skeleton className="h-4 w-1/4" />
			<Skeleton className="h-9 w-full" />
			<Skeleton className="h-3 w-2/3" />
		</div>
	);
};

const SettingsLoading = () => {
	return (
		<div className="flex-1 space-y-6 p-6">
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
					<Button variant="outline" disabled className="flex items-center gap-2">
						<RotateCcw className="size-4" />
						Reset to Defaults
					</Button>
					<Button disabled className="flex items-center gap-2">
						<Save className="size-4" />
						Loading...
					</Button>
				</div>
			</div>

			<Alert>
				<Shield className="size-4" />
				<AlertDescription>
					Changes to these settings will affect the entire system. Please review carefully before
					saving.
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
						<div className="grid gap-6 md:grid-cols-2">
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<Skeleton className="size-5 rounded" />
										<Skeleton className="h-5 w-32" />
									</CardTitle>
									<CardDescription>
										<Skeleton className="h-4 w-full" />
									</CardDescription>
								</CardHeader>
								<CardContent className="space-y-4">
									<LoadingInput />
									<LoadingInput />
									<LoadingInput />
								</CardContent>
							</Card>

							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<Skeleton className="size-5 rounded" />
										<Skeleton className="h-5 w-32" />
									</CardTitle>
									<CardDescription>
										<Skeleton className="h-4 w-full" />
									</CardDescription>
								</CardHeader>
								<CardContent className="space-y-4">
									<LoadingInput />
									<LoadingInput />
									<LoadingInput />
								</CardContent>
							</Card>
						</div>
					</motion.div>
				</TabsContent>

				<TabsContent value="notifications" className="space-y-6">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.4 }}
					>
						<div className="grid gap-6 md:grid-cols-2">
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<Skeleton className="size-5 rounded" />
										<Skeleton className="h-5 w-40" />
									</CardTitle>
									<CardDescription>
										<Skeleton className="h-4 w-full" />
									</CardDescription>
								</CardHeader>
								<CardContent className="space-y-4">
									<LoadingSwitch />
									<div className="border-t" />
									<LoadingSwitch />
								</CardContent>
							</Card>

							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<Skeleton className="size-5 rounded" />
										<Skeleton className="h-5 w-36" />
									</CardTitle>
									<CardDescription>
										<Skeleton className="h-4 w-full" />
									</CardDescription>
								</CardHeader>
								<CardContent className="space-y-4">
									<LoadingSwitch />
									<div className="border-t" />
									<LoadingSwitch />
									<div className="border-t" />
									<LoadingSwitch />
								</CardContent>
							</Card>
						</div>
					</motion.div>
				</TabsContent>

				<TabsContent value="security" className="space-y-6">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.4 }}
					>
						<div className="grid gap-6 md:grid-cols-2">
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<Skeleton className="size-5 rounded" />
										<Skeleton className="h-5 w-32" />
									</CardTitle>
									<CardDescription>
										<Skeleton className="h-4 w-full" />
									</CardDescription>
								</CardHeader>
								<CardContent className="space-y-4">
									<LoadingInput />
								</CardContent>
							</Card>

							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<Skeleton className="size-5 rounded" />
										<Skeleton className="h-5 w-40" />
									</CardTitle>
									<CardDescription>
										<Skeleton className="h-4 w-full" />
									</CardDescription>
								</CardHeader>
								<CardContent className="space-y-4">
									<LoadingInput />
								</CardContent>
							</Card>
						</div>
					</motion.div>
				</TabsContent>

				<TabsContent value="system" className="space-y-6">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.4 }}
					>
						<div className="grid gap-6 md:grid-cols-2">
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<Skeleton className="size-5 rounded" />
										<Skeleton className="h-5 w-36" />
									</CardTitle>
									<CardDescription>
										<Skeleton className="h-4 w-full" />
									</CardDescription>
								</CardHeader>
								<CardContent className="space-y-4">
									<LoadingSwitch />
									<div className="border-t" />
									<LoadingSwitch />
									<LoadingSelect />
								</CardContent>
							</Card>

							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<Skeleton className="size-5 rounded" />
										<Skeleton className="h-5 w-32" />
									</CardTitle>
									<CardDescription>
										<Skeleton className="h-4 w-full" />
									</CardDescription>
								</CardHeader>
								<CardContent className="space-y-4">
									<LoadingInput />
									<LoadingSwitch />
									<div className="border-t" />
									<LoadingSwitch />
								</CardContent>
							</Card>
						</div>
					</motion.div>
				</TabsContent>
			</Tabs>
		</div>
	);
};

export default SettingsLoading;
