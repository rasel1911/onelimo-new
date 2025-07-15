"use client";

import { motion } from "framer-motion";
import { Calendar, Car, MapPin, Users } from "lucide-react";
import { useEffect, useRef, useCallback, useMemo, memo } from "react";

import { useAgentStore } from "@/app/(booking)/store/ai-concierge-store";
import { formatDateTime } from "@/lib/format-datetime";

import { ConfirmationOverlay } from "./confirmation-overlay";
import { EmptyState } from "./empty-state";
import { InfoBadge } from "./info-badge";
import { UI_CONFIG } from "../../constants";
import { ChatProps } from "../../types";
import { throttle } from "../../utils";

const BookingWindowComponent = ({ conversationId }: ChatProps) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const pickupIconRef = useRef<HTMLDivElement>(null);
	const dropoffIconRef = useRef<HTMLDivElement>(null);
	const lineRef = useRef<HTMLDivElement>(null);

	const { bookingInfo, bookingConfirmed } = useAgentStore();

	const isEmpty = useMemo(
		() =>
			!bookingInfo.pickupLocation?.cityName &&
			!bookingInfo.dropoffLocation?.cityName &&
			!bookingInfo.passengers &&
			!bookingInfo.vehicleType,
		[bookingInfo],
	);

	const hasLocations = useMemo(
		() => bookingInfo.pickupLocation?.cityName && bookingInfo.dropoffLocation?.cityName,
		[bookingInfo.pickupLocation?.cityName, bookingInfo.dropoffLocation?.cityName],
	);

	const updateLine = useCallback(() => {
		if (
			!pickupIconRef.current ||
			!dropoffIconRef.current ||
			!lineRef.current ||
			!containerRef.current ||
			!hasLocations
		)
			return;

		if (!hasLocations && !bookingInfo.dropoffDateTime) return;

		const containerRect = containerRef.current.getBoundingClientRect();
		const pickupRect = pickupIconRef.current.getBoundingClientRect();
		const dropoffRect = dropoffIconRef.current.getBoundingClientRect();

		const isMobileLayout =
			pickupRect.left === dropoffRect.left || Math.abs(pickupRect.left - dropoffRect.left) < 10;

		if (isMobileLayout) {
			const startY = pickupRect.bottom - containerRect.top;
			const endY = dropoffRect.top - containerRect.top;
			const centerX = pickupRect.left + pickupRect.width / 2 - containerRect.left;

			lineRef.current.style.width = "2px";
			lineRef.current.style.height = `${endY - startY}px`;
			lineRef.current.style.left = `${centerX}px`;
			lineRef.current.style.top = `${startY}px`;
			lineRef.current.style.transform = "translateX(-50%)";
		} else {
			const startX = pickupRect.left + pickupRect.width / 2 - containerRect.left;
			const endX = dropoffRect.left + dropoffRect.width / 2 - containerRect.left;
			const centerY = pickupRect.top + pickupRect.height / 2 - containerRect.top;

			lineRef.current.style.width = `${endX - startX}px`;
			lineRef.current.style.height = "2px";
			lineRef.current.style.left = `${startX}px`;
			lineRef.current.style.top = `${centerY}px`;
			lineRef.current.style.transform = "none";
		}
	}, [hasLocations, bookingInfo.dropoffDateTime]);

	const throttledUpdateLine = useMemo(() => throttle(updateLine, 16), [updateLine]);

	useEffect(() => {
		if (hasLocations) {
			const timeoutId = setTimeout(throttledUpdateLine, 100);
			return () => clearTimeout(timeoutId);
		}
	}, [hasLocations, throttledUpdateLine]);

	useEffect(() => {
		if (!hasLocations) return;

		const resizeObserver = new ResizeObserver(throttledUpdateLine);

		if (containerRef.current) {
			resizeObserver.observe(containerRef.current);
		}

		return () => {
			resizeObserver.disconnect();
		};
	}, [hasLocations, throttledUpdateLine]);

	return (
		<div
			ref={containerRef}
			className={`relative min-h-[600px] w-full ${UI_CONFIG.BOOKING_WINDOW_MAX_WIDTH} overflow-hidden rounded-3xl border border-border bg-background shadow-xl transition-all duration-300 hover:shadow-2xl`}
		>
			{/* Confirmation Overlay */}
			{bookingConfirmed && !isEmpty && <ConfirmationOverlay bookingInfo={bookingInfo} />}

			{/* Empty State */}
			<EmptyState isVisible={isEmpty && !bookingConfirmed} />

			{/* Connection line between pickup and dropoff */}
			{hasLocations && (
				<motion.div
					ref={lineRef}
					className="absolute z-0 bg-primary/60"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.3 }}
				/>
			)}

			{/* Pickup Location */}
			{bookingInfo.pickupLocation?.cityName && (
				<div className="absolute left-[100px] top-[190px]">
					<div className="flex items-center space-x-2">
						<div
							ref={pickupIconRef}
							className="rounded-full border border-border bg-card p-3 shadow-md transition-all duration-300 hover:shadow-lg"
						>
							<Car className="size-5 text-primary" />
						</div>
					</div>
					<LocationDetails
						location={bookingInfo.pickupLocation}
						dateTime={bookingInfo.pickupDateTime}
					/>
				</div>
			)}

			{/* Dropoff Location */}
			{bookingInfo.dropoffLocation?.cityName && (
				<div className="absolute right-[80px] top-[190px]">
					<div className="flex items-center space-x-2">
						<div
							ref={dropoffIconRef}
							className="rounded-full border border-border bg-card p-3 shadow-md transition-all duration-300 hover:shadow-lg"
						>
							<MapPin className="size-5 text-primary" />
						</div>
					</div>
					<LocationDetails
						location={bookingInfo.dropoffLocation}
						dateTime={bookingInfo.dropoffDateTime}
					/>
				</div>
			)}

			{/* Info Badges */}
			{bookingInfo.passengers && (
				<InfoBadge
					icon={<Users className="size-5 text-primary" />}
					content={`${bookingInfo.passengers} passengers`}
					positionClasses="absolute bottom-5 left-5"
				/>
			)}

			{bookingInfo.specialRequests && (
				<InfoBadge
					icon={<span className="text-primary">💬</span>}
					content={bookingInfo.specialRequests}
					positionClasses="absolute right-5 top-5"
				/>
			)}

			{bookingInfo.vehicleType && (
				<InfoBadge
					icon={<Car className="size-5 text-primary" />}
					content={bookingInfo.vehicleType}
					positionClasses="absolute bottom-5 right-5"
				/>
			)}
		</div>
	);
};

const LocationDetails = memo(
	({
		location,
		dateTime,
	}: {
		location: { cityName: string; postCode?: string };
		dateTime?: string;
	}) => (
		<div className="mt-2 space-y-2">
			<div className="w-max rounded-full border border-border bg-card px-4 py-2 shadow-md transition-all duration-300 hover:shadow-lg">
				<p className="font-medium text-foreground">{location.cityName}</p>
			</div>
			{location.postCode && (
				<div className="flex w-max items-center space-x-1 rounded-full border border-border bg-card px-3 py-1 shadow-md transition-all duration-300 hover:shadow-lg">
					<MapPin className="size-4 text-muted-foreground" />
					<p className="text-sm text-muted-foreground">{location.postCode}</p>
				</div>
			)}
			{dateTime && (
				<div className="flex w-max items-center space-x-1 rounded-full border border-border bg-card px-3 py-1 shadow-md transition-all duration-300 hover:shadow-lg">
					<Calendar className="size-4 text-muted-foreground" />
					<p className="text-sm text-muted-foreground">{formatDateTime(dateTime)}</p>
				</div>
			)}
		</div>
	),
);

LocationDetails.displayName = "LocationDetails";

export const BookingWindow = memo(BookingWindowComponent);
