import { Badge } from "@/components/ui/badge";

interface ServiceProviderStatusBadgeProps {
	status: string;
}

export const ServiceProviderStatusBadge = ({ status }: ServiceProviderStatusBadgeProps) => {
	const getStatusVariant = (status: string) => {
		switch (status.toLowerCase()) {
			case "active":
				return "default";
			case "inactive":
				return "secondary";
			case "pending":
				return "outline";
			default:
				return "outline";
		}
	};

	const getStatusColor = (status: string) => {
		switch (status.toLowerCase()) {
			case "active":
				return "text-green-700 bg-green-100 border-green-200";
			case "inactive":
				return "text-red-700 bg-red-100 border-red-200";
			case "pending":
				return "text-yellow-700 bg-yellow-100 border-yellow-200";
			default:
				return "text-gray-700 bg-gray-100 border-gray-200";
		}
	};

	return (
		<Badge variant={getStatusVariant(status)} className={getStatusColor(status)}>
			{status.charAt(0).toUpperCase() + status.slice(1)}
		</Badge>
	);
};
