import { Activity, AlertCircle, CheckCircle, Clock, LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
	status: string;
}

const statusConfig: Record<
	string,
	{ variant: "default" | "secondary" | "destructive" | "outline"; icon: LucideIcon }
> = {
	analyzing: { variant: "default", icon: Activity },
	completed: { variant: "default", icon: CheckCircle },
	pending: { variant: "secondary", icon: Clock },
	active: { variant: "default", icon: CheckCircle },
	inactive: { variant: "secondary", icon: AlertCircle },
};

export const StatusBadge = ({ status }: StatusBadgeProps) => {
	const config = statusConfig[status] || { variant: "outline" as const, icon: AlertCircle };
	const Icon = config.icon;

	return (
		<Badge variant={config.variant} className="inline-flex items-center gap-1">
			<Icon className="size-3" />
			{status}
		</Badge>
	);
};
