"use client";

import { Clock, MapPin, Calendar, Car, ArrowRight } from "lucide-react";

import { formatTime, formatDayDate, formatLocation } from "@/lib/utils/formatting";

interface JourneyVisualizationProps {
	booking: {
		pickupLocation: { city: string; address: string; postcode: string };
		dropoffLocation: { city: string; address: string; postcode: string };
		pickupTime: string;
		estimatedDropoffTime: string;
		estimatedDuration: number;
	};
}

export function JourneyVisualization({ booking }: JourneyVisualizationProps) {
	const formatDuration = (minutes: number) => {
		const days = Math.floor(minutes / (24 * 60));
		const hours = Math.floor((minutes % (24 * 60)) / 60);
		const mins = minutes % 60;

		const parts = [];
		if (days > 0) parts.push(`${days}d`);
		if (hours > 0) parts.push(`${hours}h`);
		if (mins > 0) parts.push(`${mins}min`);

		return parts.join(" ") || "0min";
	};

	return (
		<div className="rounded-xl border bg-card p-4">
			<h3 className="mb-3 text-base font-semibold text-card-foreground">Journey Details</h3>

			<div className="flex items-start justify-between">
				{/* Pickup */}
				<div className="w-2/5">
					<div className="rounded-lg border border-white/20 bg-white/80 p-3 backdrop-blur-sm dark:bg-gray-800/80">
						<div className="mb-2 flex items-center">
							<div className="dark:bg-primary/900/30 mr-2 flex size-8 items-center justify-center rounded-full bg-primary/10">
								<Car className="size-4 text-primary" />
							</div>
							<div>
								<h4 className="text-sm font-semibold text-primary">Pickup</h4>
								<p className="text-xs text-muted-foreground">Start Location</p>
							</div>
						</div>
						<div className="ml-10 space-y-1">
							<p className="text-sm font-medium text-foreground">
								{formatLocation(booking.pickupLocation)}
							</p>
							<div className="flex items-center text-xs text-muted-foreground">
								<Calendar className="mr-1 size-3" />
								{formatDayDate(booking.pickupTime)}
							</div>
							<div className="flex items-center text-xs text-muted-foreground">
								<Clock className="mr-1 size-3" />
								{formatTime(booking.pickupTime)}
							</div>
						</div>
					</div>
				</div>

				{/* Journey Duration */}
				<div className="mt-14 flex w-1/5 flex-col items-center justify-center">
					<div className="relative w-full">
						<div className="relative h-1 w-full rounded-full bg-gradient-to-r from-primary via-primary/80 to-secondary">
							<div className="absolute left-1/4 top-1/2 -translate-y-1/2"></div>
							<div className="absolute left-2/4 top-1/2 -translate-y-1/2">
								<ArrowRight className="size-4 text-white" />
							</div>
							<div className="absolute left-3/4 top-1/2 -translate-y-1/2"></div>

							{/* Duration badge */}
							<div className="absolute left-1/2 top-5 -translate-x-1/2 whitespace-nowrap">
								<div className="rounded-full border bg-white px-3 py-1 shadow-md dark:bg-gray-800">
									<span className="text-xs font-semibold text-foreground">
										{formatDuration(booking.estimatedDuration)}
									</span>
								</div>
							</div>

							<div className="absolute -right-2 top-1/2 -translate-y-1/2"></div>
						</div>
					</div>
				</div>

				{/* Dropoff */}
				<div className="w-2/5">
					<div className="rounded-lg border border-white/20 bg-white/80 p-3 backdrop-blur-sm dark:bg-gray-800/80">
						<div className="mb-2 flex items-center">
							<div className="dark:bg-primary/900/30 mr-2 flex size-8 items-center justify-center rounded-full bg-primary/10">
								<MapPin className="size-4 text-primary" />
							</div>
							<div>
								<h4 className="text-sm font-semibold text-primary">Dropoff</h4>
								<p className="text-xs text-muted-foreground">End Location</p>
							</div>
						</div>
						<div className="ml-10 space-y-1">
							<p className="text-sm font-medium text-foreground">
								{formatLocation(booking.dropoffLocation)}
							</p>
							<div className="flex items-center text-xs text-muted-foreground">
								<Calendar className="mr-1 size-3" />
								{formatDayDate(booking.estimatedDropoffTime)}
							</div>
							<div className="flex items-center text-xs text-muted-foreground">
								<Clock className="mr-1 size-3" />
								Est. {formatTime(booking.estimatedDropoffTime)}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
