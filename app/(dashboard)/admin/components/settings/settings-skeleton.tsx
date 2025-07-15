import {
	Activity,
	Bell,
	Clock,
	Database,
	Globe,
	Mail,
	Phone,
	RefreshCw,
	RotateCcw,
	Save,
	Settings,
	Shield,
	Users,
	Zap,
} from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton, SkeletonInput, SkeletonSwitch } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function SettingsSkeleton() {
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
					<Badge variant="outline" className="text-xs">
						<Skeleton className="h-3 w-20" />
					</Badge>
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
								<SkeletonInput />
								<SkeletonInput />
								<SkeletonInput />
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Users className="size-5" />
									Provider Management
								</CardTitle>
								<CardDescription>Configure provider contact and retry settings</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<SkeletonInput />
								<SkeletonInput />
								<SkeletonInput />
							</CardContent>
						</Card>
					</div>
				</TabsContent>

				<TabsContent value="notifications" className="space-y-6">
					<div className="grid gap-6 md:grid-cols-2">
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Globe className="size-5" />
									Communication Channels
								</CardTitle>
								<CardDescription>Enable or disable notification channels</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<SkeletonSwitch />
								<Separator />
								<SkeletonSwitch />
								<Separator />
								<SkeletonSwitch />
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
								<SkeletonSwitch />
								<Separator />
								<SkeletonSwitch />
								<Separator />
								<SkeletonSwitch />
							</CardContent>
						</Card>
					</div>
				</TabsContent>

				<TabsContent value="security" className="space-y-6">
					<div className="grid gap-6 md:grid-cols-2">
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Shield className="size-5" />
									Authentication Settings
								</CardTitle>
								<CardDescription>Configure user authentication requirements</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<SkeletonSwitch />
								<Separator />
								<SkeletonInput />
								<SkeletonInput />
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<RefreshCw className="size-5" />
									Password Policy
								</CardTitle>
								<CardDescription>Configure password requirements</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<SkeletonInput />
								<Separator />
								<SkeletonSwitch />
							</CardContent>
						</Card>
					</div>
				</TabsContent>

				<TabsContent value="system" className="space-y-6">
					<div className="grid gap-6 md:grid-cols-2">
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Database className="size-5" />
									System Configuration
								</CardTitle>
								<CardDescription>Configure system-wide settings and features</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<SkeletonSwitch />
								<Separator />
								<SkeletonSwitch />
								<Separator />
								<div className="space-y-2">
									<Skeleton className="h-4 w-1/4" />
									<Skeleton className="h-9 w-full" />
									<Skeleton className="h-3 w-3/4" />
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Activity className="size-5" />
									Data Management
								</CardTitle>
								<CardDescription>Configure data retention and backup settings</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<SkeletonInput />
								<Separator />
								<SkeletonSwitch />
								<Separator />
								<SkeletonSwitch />
							</CardContent>
						</Card>
					</div>
				</TabsContent>
			</Tabs>
		</div>
	);
}
