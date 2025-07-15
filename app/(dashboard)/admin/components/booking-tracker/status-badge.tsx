import { Badge } from "@/components/ui/badge";
import { BOOKING_STATUSES } from "@/lib/workflow/constants/booking-tracker";
import { StatusBadgeProps } from "@/lib/workflow/types/booking-tracker";
import { formatStatusText } from "@/lib/workflow/utils/booking-tracker-utils";

export function StatusBadge({ status, variant }: StatusBadgeProps) {
	const getStatusVariant = (status: string, fallbackVariant?: StatusBadgeProps["variant"]) => {
		switch (status.toLowerCase()) {
			case BOOKING_STATUSES.COMPLETED:
				return "bg-emerald-500 hover:bg-emerald-600";
			case BOOKING_STATUSES.IN_PROGRESS:
				return "bg-amber-500 hover:bg-amber-600";
			case BOOKING_STATUSES.FAILED:
				return "bg-red-500 hover:bg-red-600";
			case BOOKING_STATUSES.PENDING:
			default:
				return fallbackVariant === "outline" ? "outline" : "outline";
		}
	};

	const badgeVariant = getStatusVariant(status, variant);

	if (typeof badgeVariant === "string" && badgeVariant.includes("bg-")) {
		return <Badge className={badgeVariant}>{formatStatusText(status)}</Badge>;
	}

	return <Badge variant={badgeVariant as any}>{formatStatusText(status)}</Badge>;
}
