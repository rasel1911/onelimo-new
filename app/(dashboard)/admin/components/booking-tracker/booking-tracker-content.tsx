import { AlertCircle, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useBookingTrackerModals } from "@/hooks/use-booking-tracker-modals";
import { useWorkflowTracking } from "@/hooks/use-workflow-tracking";
import { WorkflowTrackingData } from "@/lib/types/workflow-tracking";
import { BookingTrackerContentProps } from "@/lib/workflow/types/booking-tracker";

import { BookingDetails } from "./booking-details";
import { BookingHeader } from "./booking-header";
import { BookingStepsList } from "./booking-steps-list";
import { BookingTrackerModals } from "./booking-tracker-modals";
import { BookingTrackerSkeleton } from "./booking-tracker-skeleton";

export const BookingTrackerContent = ({
	className,
	selectedBookingId,
}: BookingTrackerContentProps) => {
	const {
		data: workflowData,
		isLoading,
		isError,
		error,
		refetch,
		startFetching,
	} = useWorkflowTracking({
		lazy: false,
		specificBookingId: selectedBookingId || undefined,
	});
	const { activeModal, modalData, openModal, closeModal } = useBookingTrackerModals();
	const [selectedBooking, setSelectedBooking] = useState<WorkflowTrackingData | null>(null);
	const [hasInitiallyFetched, setHasInitiallyFetched] = useState(false);

	useEffect(() => {
		if (selectedBookingId && !hasInitiallyFetched) {
			startFetching();
			setHasInitiallyFetched(true);
		}
	}, [selectedBookingId, startFetching, hasInitiallyFetched]);

	const handleRefresh = async () => {
		if (!hasInitiallyFetched) {
			startFetching();
			setHasInitiallyFetched(true);
		} else {
			await refetch();
		}
	};

	useEffect(() => {
		if (workflowData.length > 0) {
			let targetBooking: WorkflowTrackingData | null = null;

			if (selectedBookingId) {
				targetBooking =
					workflowData.find((booking) => {
						if (booking.id === selectedBookingId) return true;
						if (booking.bookingId === selectedBookingId) return true;
						if (booking.rawData?.workflowRun?.bookingRequestId === selectedBookingId) return true;
						if (booking.bookingRequest?.id === selectedBookingId) return true;
						if (booking.bookingRequest?.requestCode === selectedBookingId) return true;
						return false;
					}) || null;
			}

			setSelectedBooking(targetBooking || workflowData[0]);
		}
	}, [workflowData, selectedBookingId]);

	const handleBookingSelect = (booking: WorkflowTrackingData) => {
		setSelectedBooking(booking);
	};

	if (isError) {
		return (
			<Card className="col-span-3">
				<CardContent className="p-6">
					<Alert variant="destructive">
						<AlertCircle className="size-4" />
						<AlertDescription>
							Failed to load workflow tracking data: {error}
							<Button variant="outline" size="sm" className="ml-2" onClick={handleRefresh}>
								<RefreshCw className="mr-2 size-4" />
								Retry
							</Button>
						</AlertDescription>
					</Alert>
				</CardContent>
			</Card>
		);
	}

	if (workflowData.length === 0 && !isLoading && hasInitiallyFetched) {
		return (
			<Card className="col-span-3">
				<CardContent className="p-6">
					<div className="text-center">
						<p className="text-muted-foreground">No workflow tracking data available.</p>
						<p className="mt-2 text-sm text-muted-foreground">
							Start a booking request to see workflow tracking here.
						</p>
					</div>
				</CardContent>
			</Card>
		);
	}

	if (!selectedBooking) {
		return <BookingTrackerSkeleton />;
	}

	return (
		<Card className={`col-span-3 ${className || ""}`}>
			<BookingHeader
				selectedBooking={selectedBooking}
				workflowData={workflowData}
				isLoading={isLoading}
				onRefetch={handleRefresh}
				onBookingSelect={handleBookingSelect}
			/>
			<CardContent>
				<div className="flex flex-col space-y-4">
					<BookingDetails selectedBooking={selectedBooking} />
					<BookingStepsList
						steps={selectedBooking.steps}
						selectedBooking={selectedBooking}
						onModalOpen={openModal}
					/>
				</div>
			</CardContent>

			<BookingTrackerModals
				activeModal={activeModal}
				modalData={modalData}
				onCloseModal={closeModal}
			/>
		</Card>
	);
};
