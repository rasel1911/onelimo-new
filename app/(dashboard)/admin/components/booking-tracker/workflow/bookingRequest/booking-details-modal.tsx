"use client";

import { Calendar, User } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils/formatting";
import { type ModalProps, type BookingModalData } from "@/lib/workflow/types/modal";

import { BaseModal } from "../shared";
import { BookingInfoGrid } from "./booking-info-grid";
import { JourneyVisualization } from "./journey-visualization";
import { RequestTimeline } from "./request-timeline";

interface BookingDetailsModalProps extends ModalProps<BookingModalData> {}

export function BookingDetailsModal({ isOpen, onCloseAction, data }: BookingDetailsModalProps) {
	const booking = data?.bookingRequest;

	if (!booking) {
		return (
			<BaseModal
				isOpen={isOpen}
				onCloseAction={onCloseAction}
				title="Booking Request Details"
				description="No booking data available"
				maxWidth="md"
			>
				<div className="p-6">
					<p className="text-center text-muted-foreground">No booking data available</p>
				</div>
			</BaseModal>
		);
	}

	return (
		<BaseModal
			isOpen={isOpen}
			onCloseAction={onCloseAction}
			title={booking.customerName}
			icon={<User className="size-4 text-primary" />}
			maxWidth="4xl"
		>
			<div className="flex flex-row items-center justify-between space-y-0">
				<div className="mt-1 flex items-center">
					<Calendar className="mr-1 size-3.5" />
					{formatDate(booking.pickupTime)}
				</div>
				<Badge variant="outline" className="font-mono text-base">
					{booking.requestCode}
				</Badge>
			</div>

			<div className="grid gap-4 py-3">
				<JourneyVisualization booking={booking} />
				<BookingInfoGrid booking={booking} />
				<RequestTimeline booking={booking} />
			</div>
		</BaseModal>
	);
}
