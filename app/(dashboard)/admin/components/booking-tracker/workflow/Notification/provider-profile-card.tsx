import { User, Activity, MapPin, Star, Clock } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { ProviderNotification } from "@/lib/workflow/types/notification";
import {
	getProviderStatusColor,
	formatServiceTypes,
	getReputationStars,
} from "@/lib/workflow/utils/notification-utils";

interface ProviderProfileCardProps {
	provider: NonNullable<ProviderNotification["provider"]>;
}

export function ProviderProfileCard({ provider }: ProviderProfileCardProps) {
	return (
		<div className="space-y-4 rounded-lg border p-4">
			{/* Provider Header */}
			<div className="flex items-start justify-between">
				<div className="flex items-center space-x-3">
					<div className="flex size-12 items-center justify-center rounded-full bg-muted">
						<User className="size-6 text-muted-foreground" />
					</div>
					<div>
						<h3 className="text-lg font-semibold">{provider.name}</h3>
						<p className="text-sm text-muted-foreground">{provider.email}</p>
						<p className="text-sm text-muted-foreground">{provider.phone}</p>
					</div>
				</div>
				<Badge
					className={`${getProviderStatusColor(provider.status)} text-white`}
					variant="secondary"
				>
					{provider.status || "Unknown"}
				</Badge>
			</div>

			{/* Provider Details */}
			<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
				<div className="space-y-2">
					<div className="flex items-center gap-2">
						<Activity className="size-4 text-muted-foreground" />
						<span className="text-sm font-medium">Service Types</span>
					</div>
					<p className="pl-6 text-sm text-muted-foreground">
						{formatServiceTypes(provider.serviceType || [])}
					</p>
				</div>

				<div className="space-y-2">
					<div className="flex items-center gap-2">
						<MapPin className="size-4 text-muted-foreground" />
						<span className="text-sm font-medium">Coverage Area</span>
					</div>
					<p className="pl-6 text-sm text-muted-foreground">
						{provider.areaCovered?.join(", ") || "Not specified"}
					</p>
				</div>

				<div className="space-y-2">
					<div className="flex items-center gap-2">
						<Star className="size-4 text-muted-foreground" />
						<span className="text-sm font-medium">Reputation</span>
					</div>
					<div className="flex items-center gap-2 pl-6">
						<div className="flex">
							{Array.from({ length: 5 }).map((_, i) => (
								<Star
									key={i}
									className={`size-4 ${
										i < getReputationStars(provider.reputation || 0)
											? "fill-yellow-400 text-yellow-400"
											: "text-muted-foreground"
									}`}
								/>
							))}
						</div>
						<span className="text-sm text-muted-foreground">({provider.reputation || 0})</span>
					</div>
				</div>

				<div className="space-y-2">
					<div className="flex items-center gap-2">
						<Clock className="size-4 text-muted-foreground" />
						<span className="text-sm font-medium">Response Time</span>
					</div>
					<p className="pl-6 text-sm text-muted-foreground">
						{provider.responseTime ? `${provider.responseTime} mins` : "Not available"}
					</p>
				</div>
			</div>
		</div>
	);
}
