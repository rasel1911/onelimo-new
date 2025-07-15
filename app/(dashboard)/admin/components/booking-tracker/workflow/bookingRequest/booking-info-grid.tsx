"use client";

import { Car, Users, StickyNote } from "lucide-react";

import { formatStatusText } from "@/lib/utils/formatting";

interface BookingInfoGridProps {
	booking: {
		vehicleType: string;
		passengers: number;
		specialRequests?: string;
	};
}

export function BookingInfoGrid({ booking }: BookingInfoGridProps) {
	return (
		<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
			{/* Booking Information */}
			<div className="rounded-xl border bg-card p-3">
				<h3 className="mb-3 text-base font-semibold text-card-foreground">Booking Information</h3>
				<div className="space-y-3">
					<div className="flex items-center">
						<div className="mr-2 flex size-8 items-center justify-center rounded-full bg-white/80 dark:bg-gray-800/80">
							<Car className="size-4 text-primary" />
						</div>
						<div>
							<p className="text-xs font-medium text-muted-foreground">Vehicle Type</p>
							<p className="text-sm font-semibold text-foreground">
								{formatStatusText(booking.vehicleType)}
							</p>
						</div>
					</div>

					<div className="flex items-center">
						<div className="mr-2 flex size-8 items-center justify-center rounded-full bg-white/80 dark:bg-gray-800/80">
							<Users className="size-4 text-primary" />
						</div>
						<div>
							<p className="text-xs font-medium text-muted-foreground">Passengers</p>
							<p className="text-sm font-semibold text-foreground">{booking.passengers} people</p>
						</div>
					</div>
				</div>
			</div>

			{/* Special Requests */}
			<div className="rounded-xl border bg-card p-3">
				<div className="mb-3 flex items-center">
					<StickyNote className="mr-2 size-5 text-card-foreground" />
					<h3 className="text-base font-semibold text-card-foreground">Special Requests</h3>
				</div>
				<div className="rounded-lg border border-white/20 bg-white/80 p-3 backdrop-blur-sm dark:bg-gray-800/80">
					{booking.specialRequests ? (
						<p className="text-sm leading-relaxed text-foreground">{booking.specialRequests}</p>
					) : (
						<p className="text-sm italic text-muted-foreground">No special requests provided</p>
					)}
				</div>
			</div>
		</div>
	);
}
