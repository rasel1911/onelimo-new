import { AlertCircle } from "lucide-react";
import { Suspense } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { DashboardStats } from "./components/dashboard-stats";
import { RecentActivity } from "./components/recent-activity";
import { SectionLoading } from "./components/section-loading";
import { StatsLoading } from "./components/stats-loading";
import { WorkflowOverview } from "./components/workflow-overview";

export const dynamic = "force-dynamic";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

const StatsSection = async () => {
	try {
		const response = await fetch(`${BASE_URL}/api/dashboard/stats`, {
			cache: "no-store",
		});

		if (!response.ok) {
			throw new Error("Failed to fetch stats");
		}

		const stats = await response.json();
		return <DashboardStats stats={stats} />;
	} catch (error) {
		console.error("Error loading stats:", error);
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<AlertCircle className="size-5 text-red-500" />
						Error Loading Stats
					</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-sm text-muted-foreground">
						Failed to load dashboard statistics. Please try refreshing the page.
					</p>
				</CardContent>
			</Card>
		);
	}
};

const RecentActivitySection = async () => {
	try {
		const response = await fetch(`${BASE_URL}/api/dashboard/recent-activity`, {
			cache: "no-store",
		});

		if (!response.ok) {
			throw new Error("Failed to fetch recent activity");
		}

		const { recentBookings, recentWorkflows } = await response.json();

		return <RecentActivity recentBookings={recentBookings} recentWorkflows={recentWorkflows} />;
	} catch (error) {
		console.error("Error loading recent activity:", error);
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<AlertCircle className="size-5 text-red-500" />
						Error Loading Recent Activity
					</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-sm text-muted-foreground">
						Failed to load recent activity. Please try refreshing the page.
					</p>
				</CardContent>
			</Card>
		);
	}
};

const WorkflowOverviewSection = async () => {
	try {
		const response = await fetch(`${BASE_URL}/api/dashboard/workflow-overview`, {
			cache: "no-store",
		});

		if (!response.ok) {
			throw new Error("Failed to fetch workflow overview");
		}

		const { workflowStatus, completionRate } = await response.json();

		return <WorkflowOverview workflowStatus={workflowStatus} completionRate={completionRate} />;
	} catch (error) {
		console.error("Error loading workflow overview:", error);
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<AlertCircle className="size-5 text-red-500" />
						Error Loading Workflow Overview
					</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-sm text-muted-foreground">
						Failed to load workflow overview. Please try refreshing the page.
					</p>
				</CardContent>
			</Card>
		);
	}
};

const AdminDashboard = () => {
	return (
		<div className="space-y-6">
			<div className="mb-6">
				<h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
				<p className="text-muted-foreground">
					Monitor booking requests, workflow performance, and service provider activity.
				</p>
			</div>

			<Suspense fallback={<StatsLoading />}>
				<StatsSection />
			</Suspense>

			<Suspense fallback={<SectionLoading title="Recent Activity" rows={3} />}>
				<RecentActivitySection />
			</Suspense>

			<Suspense fallback={<SectionLoading title="Workflow Overview" rows={4} />}>
				<WorkflowOverviewSection />
			</Suspense>
		</div>
	);
};

export default AdminDashboard;
