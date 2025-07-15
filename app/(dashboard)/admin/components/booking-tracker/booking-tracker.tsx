import { Suspense } from "react";

import { BookingTrackerProps } from "@/lib/workflow/types/booking-tracker";

import { BookingTrackerContent } from "./booking-tracker-content";
import { BookingTrackerSkeleton } from "./booking-tracker-skeleton";

export function BookingTracker({ className, selectedBookingId }: BookingTrackerProps) {
	return (
		<Suspense fallback={<BookingTrackerSkeleton />}>
			<BookingTrackerContent className={className} selectedBookingId={selectedBookingId} />
		</Suspense>
	);
}
