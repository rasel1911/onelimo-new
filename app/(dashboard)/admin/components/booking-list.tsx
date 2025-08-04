"use client";

import { Eye } from "lucide-react";
import { useState, forwardRef, useImperativeHandle, useCallback } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { BookingWithStatus } from "@/lib/types/booking-request";
import { formatLocation } from "@/lib/utils/formatting";

import { BookingListSkeleton } from "./booking-list-skeleton";

interface BookingListProps {
	onViewTimeline?: (bookingId: string) => void;
}

export type BookingListRef = {
	startFetching: () => void;
};

export const BookingList = forwardRef<BookingListRef, BookingListProps>(
	({ onViewTimeline }, ref) => {
		const [bookings, setBookings] = useState<BookingWithStatus[]>([]);
		const [loading, setLoading] = useState(false);
		const [initialLoading, setInitialLoading] = useState(true);
		const [error, setError] = useState<string | null>(null);
		const [hasMore, setHasMore] = useState(true);
		const [page, setPage] = useState(1);
		const [total, setTotal] = useState(0);
		const [hasStartedFetching, setHasStartedFetching] = useState(false);

		const fetchBookings = useCallback(async (pageNum: number, append: boolean = false) => {
			try {
				setLoading(true);
				setError(null);

				const response = await fetch(`/api/booking-tracker?page=${pageNum}&limit=10`);
				if (!response.ok) {
					throw new Error("Failed to fetch bookings");
				}

				const data = await response.json();

				if (append) {
					setBookings((prev) => [...prev, ...data.bookings]);
				} else {
					setBookings(data.bookings);
				}

				setHasMore(data.hasMore);
				setTotal(data.total);
				setHasStartedFetching(true);
			} catch (err) {
				setError(err instanceof Error ? err.message : "An error occurred");
			} finally {
				setLoading(false);
				setInitialLoading(false);
			}
		}, []);

		const loadMore = () => {
			const nextPage = page + 1;
			setPage(nextPage);
			fetchBookings(nextPage, true);
		};

		const getStatusBadge = (status: string | null) => {
			if (!status) {
				return <Badge variant="outline">No Workflow</Badge>;
			}

			switch (status) {
				case "completed":
					return <Badge className="bg-emerald-500 hover:bg-emerald-600">Completed</Badge>;
				case "analyzing":
				case "in-progress":
					return <Badge className="bg-amber-500 hover:bg-amber-600">In Progress</Badge>;
				case "waiting":
					return <Badge className="bg-blue-500 hover:bg-blue-600">Waiting</Badge>;
				case "failed":
					return <Badge variant="destructive">Failed</Badge>;
				default:
					return <Badge variant="outline">{status}</Badge>;
			}
		};

		const formatDate = (date: Date | string) => {
			return new Date(date).toLocaleDateString("en-US", {
				year: "numeric",
				month: "short",
				day: "numeric",
			});
		};

		const startFetching = useCallback(() => {
			if (!hasStartedFetching) {
				setPage(1);
				fetchBookings(1);
			}
		}, [hasStartedFetching, fetchBookings]);

		useImperativeHandle(ref, () => ({
			startFetching,
		}));

		if (initialLoading && !hasStartedFetching) {
			return <BookingListSkeleton />;
		}

		if (error) {
			return (
				<div className="rounded-md border">
					<div className="p-8 text-center">
						<div className="mb-4 text-red-500">Error: {error}</div>
						<Button
							onClick={() => {
								setHasStartedFetching(false);
								setInitialLoading(true);
								startFetching();
							}}
							variant="outline"
						>
							Try Again
						</Button>
					</div>
				</div>
			);
		}

		if (bookings.length === 0 && !loading && hasStartedFetching) {
			return (
				<div className="rounded-md border">
					<div className="p-8 text-center">
						<div className="text-muted-foreground">No bookings found</div>
					</div>
				</div>
			);
		}

		return (
			<div className="space-y-4">
				<div className="rounded-md border">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>ID</TableHead>
								<TableHead>Customer</TableHead>
								<TableHead>Service</TableHead>
								<TableHead>Route</TableHead>
								<TableHead>Date</TableHead>
								<TableHead>Status</TableHead>
								<TableHead className="w-[120px]">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{bookings.map((booking) => (
								<TableRow key={booking.id}>
									<TableCell className="font-medium">{booking.requestCode}</TableCell>
									<TableCell>
										<div>
											<div className="font-medium">{booking.customerName}</div>
											<div className="text-xs text-muted-foreground">
												{booking.passengers} passenger{booking.passengers !== 1 ? "s" : ""}
											</div>
										</div>
									</TableCell>
									<TableCell>{booking.vehicleType}</TableCell>
									<TableCell>
										<div className="text-sm">
											<div>From: {formatLocation(booking.pickupLocation)}</div>
											<div className="text-muted-foreground">
												To: {formatLocation(booking.dropoffLocation)}
											</div>
										</div>
									</TableCell>
									<TableCell>{formatDate(booking.pickupTime)}</TableCell>
									<TableCell>{getStatusBadge(booking.workflowStatus)}</TableCell>
									<TableCell>
										<Button
											variant="ghost"
											size="sm"
											onClick={() => onViewTimeline?.(booking.id)}
											className="flex items-center gap-2"
										>
											<Eye className="size-4" />
											<span className="text-xs">View Timeline</span>
										</Button>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>

				{hasMore && bookings.length > 0 && (
					<div className="flex justify-center">
						<Button onClick={loadMore} disabled={loading} variant="outline">
							{loading ? "Loading..." : `Load More (${bookings.length} of ${total})`}
						</Button>
					</div>
				)}
			</div>
		);
	},
);

BookingList.displayName = "BookingList";
