"use client";

import { Suspense, useState, useRef } from "react";

import { BookingList, BookingListRef } from "@/app/(dashboard)/admin/components/booking-list";
import { BookingListSkeleton } from "@/app/(dashboard)/admin/components/booking-list-skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { BookingTracker } from "../components/booking-tracker";

export default function BookingsPage() {
	const [activeTab, setActiveTab] = useState("tracker");
	const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
	const bookingListRef = useRef<BookingListRef>(null);

	const handleTabChange = (value: string) => {
		setActiveTab(value);

		if (value === "list") {
			setTimeout(() => {
				bookingListRef.current?.startFetching();
			}, 20);
		}
	};

	const handleViewTimeline = (bookingId: string) => {
		setSelectedBookingId(bookingId);
		setActiveTab("tracker");
	};

	return (
		<div className="flex flex-col gap-5">
			<div>
				<h1 className="text-3xl font-bold tracking-tight">Bookings</h1>
				<p className="text-muted-foreground">
					Track and manage all booking requests in the system.
				</p>
			</div>

			<Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
				<div className="flex justify-end">
					<TabsList>
						<TabsTrigger value="tracker">Booking Tracker</TabsTrigger>
						<TabsTrigger value="list">All Bookings</TabsTrigger>
					</TabsList>
				</div>

				<TabsContent value="tracker" className="space-y-4">
					<Suspense fallback={<div>Loading booking tracker...</div>}>
						<BookingTracker selectedBookingId={selectedBookingId} />
					</Suspense>
				</TabsContent>

				<TabsContent value="list" className="space-y-4">
					<Suspense fallback={<BookingListSkeleton />}>
						<BookingList ref={bookingListRef} onViewTimeline={handleViewTimeline} />
					</Suspense>
				</TabsContent>
			</Tabs>
		</div>
	);
}
