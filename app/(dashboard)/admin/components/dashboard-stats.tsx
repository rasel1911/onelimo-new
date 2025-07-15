import { Building2, Calendar, MapPin, Shield, UserCheck, Users } from "lucide-react";

import { StatCard } from "./stat-card";

interface DashboardStatsProps {
	stats: {
		bookingRequests: number;
		serviceProviders: number;
		locations: number;
		activeUsers: number;
		admins: number;
		invitations: number;
		activeWorkflows: number;
		completedWorkflows: number;
	};
}

export const DashboardStats = ({ stats }: DashboardStatsProps) => {
	return (
		<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
			<StatCard
				title="Booking Requests"
				value={stats.bookingRequests}
				description="Total requests"
				icon={Calendar}
				href="/admin/booking-tracker"
				linkText="View all"
			/>

			<StatCard
				title="Service Providers"
				value={stats.serviceProviders}
				description="Active providers"
				icon={Building2}
				href="/admin/service-providers"
				linkText="Manage"
			/>

			<StatCard
				title="Locations"
				value={stats.locations}
				description="Service areas"
				icon={MapPin}
				href="/admin/locations"
				linkText="Manage"
			/>
			<StatCard
				title="Partner Invitations"
				value={stats.invitations}
				description="Pending invitations"
				icon={UserCheck}
				href="/admin/service-providers/invites"
				linkText="Manage"
			/>

			<StatCard title="Admins" value={stats.admins} description="Admin users" icon={Shield} />

			<StatCard
				title="Customers"
				value={stats.activeUsers}
				description="Active customers"
				icon={Users}
			/>
		</div>
	);
};
