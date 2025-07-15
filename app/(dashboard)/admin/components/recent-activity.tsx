import { Activity, Calendar, Car } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

import { StatusBadge } from "./status-badge";

interface RecentActivityProps {
	recentBookings: Array<{
		id: string;
		requestCode: string;
		customerName: string;
		vehicleType: string;
		passengers: number;
		createdAt: string;
		workflowStatus?: string;
		totalQuotesReceived?: number;
	}>;
	recentWorkflows: Array<{
		id: string;
		customerName: string;
		status: string;
		currentStep: string;
		totalProvidersContacted?: number;
		totalQuotesReceived?: number;
		updatedAt: string;
	}>;
}

export const RecentActivity = ({ recentBookings, recentWorkflows }: RecentActivityProps) => {
	return (
		<div className="grid gap-6 md:grid-cols-2">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Calendar className="size-5" />
						Recent Bookings
					</CardTitle>
					<CardDescription>Latest booking requests</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						{recentBookings.length === 0 ? (
							<p className="text-sm text-muted-foreground">No recent bookings</p>
						) : (
							recentBookings.map((booking) => (
								<div key={booking.id} className="flex items-center justify-between space-x-4">
									<div className="min-w-0 flex-1">
										<p className="truncate text-sm font-medium">
											{booking.requestCode} - {booking.customerName}
										</p>
										<div className="flex items-center gap-2 text-xs text-muted-foreground">
											<Car className="size-3" />
											{booking.vehicleType} • {booking.passengers} passengers
										</div>
										<p className="text-xs text-muted-foreground">
											{new Date(booking.createdAt).toLocaleDateString()}
										</p>
									</div>
									<div className="flex flex-col items-end gap-1">
										<StatusBadge status={booking.workflowStatus || "pending"} />
										{(booking.totalQuotesReceived || 0) > 0 && (
											<span className="text-xs text-green-600">
												{booking.totalQuotesReceived} quotes
											</span>
										)}
									</div>
								</div>
							))
						)}
					</div>
				</CardContent>
				<CardFooter>
					<Link href="/admin/booking-tracker">
						<Button variant="outline" size="sm">
							View all bookings
						</Button>
					</Link>
				</CardFooter>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Activity className="size-5" />
						Recent Workflows
					</CardTitle>
					<CardDescription>Latest workflow updates</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						{recentWorkflows.length === 0 ? (
							<p className="text-sm text-muted-foreground">No recent workflow activity</p>
						) : (
							recentWorkflows.map((workflow) => (
								<div key={workflow.id} className="flex items-center justify-between space-x-4">
									<div className="min-w-0 flex-1">
										<p className="truncate text-sm font-medium">
											{workflow.customerName || "Unknown Customer"}
										</p>
										<p className="text-xs text-muted-foreground">Step: {workflow.currentStep}</p>
										<p className="text-xs text-muted-foreground">
											{new Date(workflow.updatedAt).toLocaleDateString()}
										</p>
									</div>
									<div className="flex flex-col items-end gap-1">
										<StatusBadge status={workflow.status} />
										<div className="flex gap-2 text-xs text-muted-foreground">
											<span>{workflow.totalProvidersContacted || 0} contacted</span>
											<span>{workflow.totalQuotesReceived || 0} quotes</span>
										</div>
									</div>
								</div>
							))
						)}
					</div>
				</CardContent>
			</Card>
		</div>
	);
};
