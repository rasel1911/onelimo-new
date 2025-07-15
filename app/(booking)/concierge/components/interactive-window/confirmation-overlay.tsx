"use client";

import { motion } from "framer-motion";
import { CheckCircle, Car, Clock, MapPin, Users } from "lucide-react";
import { memo } from "react";

import { useAgentStore } from "@/app/(booking)/store/ai-concierge-store";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/format-datetime";

import { ConfirmationOverlayProps } from "../../types";

const ConfirmationOverlayComponent = ({ bookingInfo }: ConfirmationOverlayProps) => {
	const { resetBookingInfo } = useAgentStore();

	return (
		<div className="absolute inset-0 z-50 flex flex-col items-center justify-center p-2 backdrop-blur-md">
			<motion.div
				initial={{ scale: 0 }}
				animate={{ scale: 1 }}
				transition={{ delay: 0.3, type: "spring" }}
				className="mb-4 rounded-full bg-primary/20 p-5 ring-2 ring-primary/30"
			>
				<CheckCircle className="size-10 text-primary" />
			</motion.div>

			<motion.p
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.5 }}
				className="mb-4 max-w-2xl text-center text-lg text-muted-foreground"
			>
				Thank you for your booking. We&apos;ll be in touch soon with your luxury vehicle details.
				You&apos;ll receive a notification shortly.
			</motion.p>

			<motion.div
				initial={{ opacity: 0, y: 30 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.6 }}
				className="w-full max-w-2xl rounded-xl border border-border bg-card p-6 shadow-lg"
			>
				{/* Journey Details - Two Column Layout */}
				<div className="grid grid-cols-2 gap-4">
					<div className="space-y-3">
						{/* From */}
						<InfoRow
							icon={<Car className="size-4 text-primary" />}
							label="From"
							value={`${bookingInfo.pickupLocation?.postCode}, ${bookingInfo.pickupLocation?.cityName}`}
						/>
						{/* Pickup Time */}
						{bookingInfo.pickupDateTime && (
							<InfoRow
								icon={<Clock className="size-4 text-primary" />}
								label="Pickup Time"
								value={formatDateTime(bookingInfo.pickupDateTime)}
							/>
						)}
					</div>
					<div className="space-y-3">
						<InfoRow
							icon={<MapPin className="size-4 text-primary" />}
							label="To"
							value={`${bookingInfo.dropoffLocation?.postCode}, ${bookingInfo.dropoffLocation?.cityName}`}
						/>
						{/* Passengers */}
						{bookingInfo.passengers && (
							<InfoRow
								icon={<Users className="size-4 text-primary" />}
								label="Passengers"
								value={`${bookingInfo.passengers} ${bookingInfo.passengers === 1 ? "passenger" : "passengers"}`}
							/>
						)}
					</div>
				</div>

				{/* Special Message */}
				<div className="mt-3 rounded-lg bg-muted/30 p-3">
					<div className="flex items-start gap-3">
						<div className="text-primary">💬</div>
						<div className="flex-1">
							<div className="text-xs text-muted-foreground">Special Message</div>
							<div className="text-sm font-medium">
								{bookingInfo.specialRequests || "No special message provided"}
							</div>
						</div>
					</div>
				</div>
			</motion.div>

			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.8 }}
			>
				<Button
					onClick={resetBookingInfo}
					variant="outline"
					className="mt-5 rounded-full border-2 border-primary/20 bg-background/80 px-8 py-3 font-semibold text-primary transition-all hover:border-primary/40 hover:bg-primary/5 hover:shadow-lg"
				>
					<Car className="mr-2 size-4" />
					Book Another Ride
				</Button>
			</motion.div>
		</div>
	);
};

export const ConfirmationOverlay = memo(ConfirmationOverlayComponent);

const InfoRow = ({
	icon,
	label,
	value,
}: {
	icon: React.ReactNode;
	label: string;
	value: string;
}) => {
	return (
		<div className="flex items-center gap-3 rounded-lg bg-muted/30 p-3">
			{icon}
			<div>
				<div className="text-xs text-muted-foreground">{label}</div>
				<div className="text-sm font-medium">{value}</div>
			</div>
		</div>
	);
};
