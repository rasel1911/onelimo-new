import { Badge } from "@/components/ui/badge";
import { WorkflowTrackingData } from "@/lib/types/workflow-tracking";
import {
	formatStatusText,
	formatTimestamp,
	isCompletedStatus,
} from "@/lib/workflow/utils/booking-tracker-utils";

interface BookingDetailsProps {
	selectedBooking: WorkflowTrackingData;
}

export function BookingDetails({ selectedBooking }: BookingDetailsProps) {
	return (
		<div className="flex items-center justify-between">
			<div>
				<h3 className="text-lg font-semibold">{selectedBooking.customer}</h3>
				<p className="text-sm text-muted-foreground">
					{formatStatusText(selectedBooking.service)} • {selectedBooking.location}
				</p>
				<p className="text-xs text-muted-foreground">{formatTimestamp(selectedBooking.date)}</p>
			</div>
			<Badge variant={isCompletedStatus(selectedBooking.status) ? "default" : "outline"}>
				{formatStatusText(selectedBooking.status)}
			</Badge>
		</div>
	);
}
