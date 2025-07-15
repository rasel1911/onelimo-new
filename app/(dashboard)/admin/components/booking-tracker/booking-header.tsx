import { Loader2, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookingHeaderProps } from "@/lib/workflow/types/booking-tracker";
import { calculateTabsWidth, getTabsGridClass } from "@/lib/workflow/utils/booking-tracker-utils";

export const BookingHeader = ({
	selectedBooking,
	workflowData,
	isLoading,
	onRefetch,
	onBookingSelect,
}: BookingHeaderProps) => {
	return (
		<CardHeader>
			<div className="flex items-center justify-between">
				<div>
					<CardTitle className="flex items-center gap-2">
						Booking Process Tracker
						{isLoading && <Loader2 className="size-4 animate-spin" />}
					</CardTitle>
					<CardDescription>Track the status of service booking requests</CardDescription>
				</div>
				<div className="flex items-center gap-2">
					<Button variant="outline" size="sm" onClick={onRefetch} disabled={isLoading}>
						<RefreshCw className={`mr-2 size-4 ${isLoading ? "animate-spin" : ""}`} />
						Refresh
					</Button>
					{workflowData.length > 0 && (
						<Tabs
							value={selectedBooking.id}
							className={calculateTabsWidth(workflowData.length)}
							onValueChange={(value) => {
								const booking = workflowData.find((b) => b.id === value);
								if (booking) onBookingSelect(booking);
							}}
						>
							<TabsList className={getTabsGridClass(workflowData.length)}>
								{workflowData.slice(0, 2).map((booking) => (
									<TabsTrigger key={booking.id} value={booking.id}>
										{booking.bookingId}
									</TabsTrigger>
								))}
							</TabsList>
						</Tabs>
					)}
				</div>
			</div>
		</CardHeader>
	);
};
