"use client";

import {
	ArrowRight,
	AlertCircle,
	Calendar,
	Car,
	CheckCircle,
	Clock,
	MapPin,
	StickyNote,
	Users,
	XCircle,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { LocationType } from "@/db/schema";
import { useToast } from "@/hooks/use-toast";
import {
	BookingRequestResponse as BookingRequest,
	BookingRequestApiResponse,
} from "@/lib/types/booking-request";
import { formatStatusText } from "@/lib/workflow/utils";

import { AITextArea } from "./ai-text-area";

interface ReceivedBookingRequestProps {
	bookingReqHash?: string;
}

const CACHE_KEY_PREFIX = "booking_request_";
const CACHE_DURATION = 2 * 60 * 60 * 1000;

export const ReceivedBookingRequest = ({ bookingReqHash }: ReceivedBookingRequestProps) => {
	const searchParams = useSearchParams();
	const hash = bookingReqHash || searchParams.get("hash");
	const { toast } = useToast();

	const [booking, setBooking] = useState<BookingRequest | null>(null);
	const [note, setNote] = useState("");
	const [quoteAmount, setQuoteAmount] = useState("");
	const [quoteType, setQuoteType] = useState<"fixed" | "hourly">("fixed");
	const [showAcceptModal, setShowAcceptModal] = useState(false);
	const [showRejectModal, setShowRejectModal] = useState(false);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [submitting, setSubmitting] = useState(false);
	const [successModal, setSuccessModal] = useState<{
		show: boolean;
		type: "accept" | "reject";
	}>({ show: false, type: "accept" });

	const getCachedData = useCallback((key: string) => {
		try {
			const cached = localStorage.getItem(key);
			if (!cached) return null;

			const { data, timestamp } = JSON.parse(cached);
			if (Date.now() - timestamp > CACHE_DURATION) {
				localStorage.removeItem(key);
				return null;
			}
			return data;
		} catch {
			return null;
		}
	}, []);

	const setCachedData = useCallback((key: string, data: any) => {
		try {
			localStorage.setItem(
				key,
				JSON.stringify({
					data,
					timestamp: Date.now(),
				}),
			);
		} catch {}
	}, []);

	const fetchBookingData = useCallback(async () => {
		if (!hash) {
			setError("No booking request hash provided");
			setLoading(false);
			return;
		}

		const cacheKey = `${CACHE_KEY_PREFIX}${hash}`;
		const cachedData = getCachedData(cacheKey);

		if (cachedData) {
			setBooking(cachedData);
			setLoading(false);
			return;
		}

		try {
			setLoading(true);
			setError(null);

			const response = await fetch(`/api/bq/${hash}`);

			const result: BookingRequestApiResponse = await response.json();

			if (!response.ok) {
				const errorMessage = !result.success ? result.error : "Failed to fetch booking request";
				throw new Error(errorMessage || "Failed to fetch booking request");
			}

			if (result.success) {
				setBooking(result.data);
				setCachedData(cacheKey, result.data);
			} else {
				throw new Error(result.error || "Unknown error occurred");
			}
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : "Failed to load booking request";
			setError(errorMessage);

			if (errorMessage.includes("expired")) {
				toast({
					title: "Link Expired",
					description: "This booking request link has expired. Please contact support.",
					variant: "destructive",
				});
			}
		} finally {
			setLoading(false);
		}
	}, [hash, getCachedData, setCachedData, toast]);

	const submitResponse = useCallback(
		async (action: "accept" | "reject") => {
			if (!hash || !booking) return;

			try {
				setSubmitting(true);

				const payload = {
					action,
					...(action === "accept" && {
						quoteAmount,
						quoteType,
					}),
					notes: note,
				};

				const response = await fetch(`/api/bq/${hash}/respond`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(payload),
				});

				const result = await response.json();

				if (!response.ok) {
					throw new Error(result.error || "Failed to submit response");
				}

				setBooking((prev) =>
					prev
						? {
								...prev,
								status: action === "accept" ? "accepted" : "rejected",
								hasResponded: true,
								responseStatus: action === "accept" ? "accepted" : "rejected",
								responseTime: new Date().toISOString(),
								...(action === "accept" && {
									hasQuoted: true,
									quoteAmount: parseFloat(quoteAmount) * 100,
									quoteTime: new Date().toISOString(),
								}),
							}
						: null,
				);

				const cacheKey = `${CACHE_KEY_PREFIX}${hash}`;
				localStorage.removeItem(cacheKey);

				toast({
					title: action === "accept" ? "Booking Accepted" : "Booking Rejected",
					description: result.message,
					variant: "default",
				});

				setSuccessModal({ show: true, type: action });
			} catch (err) {
				const errorMessage = err instanceof Error ? err.message : "Failed to submit response";
				toast({
					title: "Error",
					description: errorMessage,
					variant: "destructive",
				});
			} finally {
				setSubmitting(false);
			}
		},
		[hash, booking, quoteAmount, quoteType, note, toast],
	);

	useEffect(() => {
		fetchBookingData();
	}, [fetchBookingData]);

	const handleAccept = () => {
		setNote("");
		setQuoteAmount("");
		setQuoteType("fixed");
		setShowAcceptModal(true);
	};

	const handleReject = () => {
		setNote("");
		setShowRejectModal(true);
	};

	const confirmAccept = async () => {
		if (!quoteAmount.trim()) return;
		await submitResponse("accept");
		setShowAcceptModal(false);
	};

	const confirmReject = async () => {
		if (!note.trim()) return;
		await submitResponse("reject");
		setShowRejectModal(false);
	};

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return new Intl.DateTimeFormat("en-US", {
			dateStyle: "medium",
			timeStyle: "short",
		}).format(date);
	};

	const formatTime = (dateString: string) => {
		const date = new Date(dateString);
		return new Intl.DateTimeFormat("en-US", {
			hour: "numeric",
			minute: "numeric",
			hour12: true,
		}).format(date);
	};

	const formatDayDate = (dateString: string) => {
		const date = new Date(dateString);
		return new Intl.DateTimeFormat("en-US", {
			weekday: "long",
			month: "long",
			day: "numeric",
		}).format(date);
	};

	if (loading) {
		return (
			<div className="mx-auto max-w-4xl space-y-6">
				<Card className="overflow-hidden">
					<CardHeader>
						<Skeleton className="mb-2 h-5 w-40" />
						<Skeleton className="h-4 w-60" />
					</CardHeader>
					<CardContent className="grid gap-4">
						<div>
							<Skeleton className="mb-2 h-4 w-32" />
							<Skeleton className="h-4 w-full" />
						</div>
						<div>
							<Skeleton className="mb-2 h-4 w-32" />
							<Skeleton className="h-4 w-full" />
						</div>
						<div className="grid grid-cols-2 gap-4">
							<Skeleton className="h-20 w-full" />
							<Skeleton className="h-20 w-full" />
						</div>
					</CardContent>
					<CardFooter className="flex justify-between bg-muted/50 py-4">
						<Skeleton className="h-10 w-[48%]" />
						<Skeleton className="h-10 w-[48%]" />
					</CardFooter>
				</Card>
			</div>
		);
	}

	if (error) {
		return (
			<div className="mx-auto max-w-4xl">
				<Alert variant="destructive">
					<AlertCircle className="size-4" />
					<AlertDescription>{error}</AlertDescription>
				</Alert>
				<Button className="mt-4" onClick={fetchBookingData} disabled={loading}>
					Try Again
				</Button>
			</div>
		);
	}

	if (!booking || (booking.hasResponded && booking.status !== "pending")) {
		return (
			<div className="mx-auto max-w-4xl">
				<Card>
					<CardContent className="flex flex-col items-center justify-center py-10 pt-6">
						<CheckCircle className="mb-4 size-12 text-muted-foreground" />
						<p className="text-center font-medium text-muted-foreground">
							{booking?.hasResponded
								? `You have ${booking.responseStatus || "processed"} this booking request.`
								: "No pending booking requests at this time."}
						</p>
						<p className="mt-1 text-center text-sm text-muted-foreground/80">
							{booking?.hasResponded
								? "Thank you for your response. You will be notified of the customer's response."
								: "All requests have been handled. Check back later for new bookings."}
						</p>
						{booking?.hasQuoted && booking.quoteAmount && (
							<div className="mt-3 text-center">
								<p className="text-sm text-muted-foreground">
									Your quote: <span className="font-medium">£{booking.quoteAmount / 100}</span>
								</p>
								{booking.quoteTime && (
									<p className="text-xs text-muted-foreground/60">
										Submitted: {formatDate(booking.quoteTime)}
									</p>
								)}
							</div>
						)}
					</CardContent>
				</Card>
			</div>
		);
	}

	const renderLocation = (location: LocationType) => {
		if (typeof location === "string") return location;
		if (location?.city && location?.postcode) {
			return `${location.city}, ${location.postcode}`;
		}
		return "Location not specified";
	};

	return (
		<div className="mx-auto max-w-4xl space-y-6">
			<Card className="overflow-hidden">
				<CardHeader className="flex flex-row items-center justify-between">
					<div>
						<CardTitle className="flex items-center">
							<span>{booking.customerName}</span>
							<span className="ml-2 rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">
								{formatStatusText(booking.vehicleType)}
							</span>
						</CardTitle>
						<CardDescription className="mt-1 flex items-center">
							<Calendar className="mr-1 size-3.5" />
							{formatDate(booking.createdAt)}
						</CardDescription>
					</div>
					<Badge variant="outline" className="font-mono text-lg">
						{booking.requestCode}
					</Badge>
				</CardHeader>
				<CardContent className="grid gap-6">
					<div className="grid grid-cols-1 gap-4 pb-2">
						{/* Journey visualization */}
						<div className="flex items-start justify-between">
							{/* Pickup side */}
							<div className="w-[45%]">
								<div className="rounded-lg bg-muted/30 p-4">
									<div className="mb-2 flex items-center">
										<div className="mr-2 flex size-8 items-center justify-center rounded-full bg-primary/20">
											<Car className="size-4 text-primary" />
										</div>
										<h3 className="text-sm font-medium">Pickup</h3>
									</div>
									<p className="ml-10 text-sm text-muted-foreground">
										{renderLocation(booking.pickupLocation)}
									</p>
									<div className="ml-10 mt-2 flex flex-col space-y-1">
										<div className="flex items-center">
											<Calendar className="mr-1.5 size-3.5 text-muted-foreground" />
											<p className="text-xs text-muted-foreground">
												{formatDayDate(booking.pickupTime)}
											</p>
										</div>
										<div className="flex items-center">
											<Clock className="mr-1.5 size-3.5 text-muted-foreground" />
											<p className="text-xs text-muted-foreground">
												{formatTime(booking.pickupTime)}
											</p>
										</div>
									</div>
								</div>
							</div>

							{/* Center timeline */}
							<div className="mt-20 flex w-1/5 flex-col items-center justify-center">
								<div className="relative w-full">
									<div className="relative h-0.5 w-full bg-muted-foreground/30">
										<div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
											<span className="rounded-full bg-muted/70 px-2 py-1 text-xs font-medium">
												{booking.estimatedDuration} min
											</span>
										</div>
										<ArrowRight className="absolute left-1/2 top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 text-muted-foreground" />
									</div>
								</div>
							</div>

							{/* Dropoff side */}
							<div className="w-[45%]">
								<div className="rounded-lg bg-muted/30 p-4">
									<div className="mb-2 flex items-center">
										<div className="mr-2 flex size-8 items-center justify-center rounded-full bg-primary/20">
											<MapPin className="size-4 text-primary" />
										</div>
										<h3 className="text-sm font-medium">Dropoff</h3>
									</div>
									<p className="ml-10 text-sm text-muted-foreground">
										{renderLocation(booking.dropoffLocation)}
									</p>
									<div className="ml-10 mt-2 flex flex-col space-y-1">
										<div className="flex items-center">
											<Calendar className="mr-1.5 size-3.5 text-muted-foreground" />
											<p className="text-xs text-muted-foreground">
												{formatDayDate(booking.estimatedDropoffTime)}
											</p>
										</div>
										<div className="flex items-center">
											<Clock className="mr-1.5 size-3.5 text-muted-foreground" />
											<p className="text-xs text-muted-foreground">
												Est. {formatTime(booking.estimatedDropoffTime)}
											</p>
										</div>
									</div>
								</div>
							</div>
						</div>

						{/* Details section */}
						<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
							{/* Vehicle and passenger details */}
							<div className="rounded-lg bg-muted/20 p-4">
								<div className="space-y-3">
									<div className="flex items-center">
										<div className="mr-2 flex size-8 items-center justify-center rounded-full bg-muted/50">
											<Car className="size-4 text-muted-foreground" />
										</div>
										<div>
											<h3 className="text-sm font-medium">Vehicle</h3>
											<p className="text-sm text-muted-foreground">
												{formatStatusText(booking.vehicleType)}
											</p>
										</div>
									</div>

									<div className="flex items-center">
										<div className="mr-2 flex size-8 items-center justify-center rounded-full bg-muted/50">
											<Users className="size-4 text-muted-foreground" />
										</div>
										<div>
											<h3 className="text-sm font-medium">Passengers</h3>
											<p className="text-sm text-muted-foreground">{booking.passengers} people</p>
										</div>
									</div>
								</div>
							</div>

							{/* Special notes */}
							{booking.specialRequests && (
								<div className="relative rounded-lg border-l-4 border-slate-600 bg-slate-800 p-4 shadow-sm">
									<div className="absolute -right-2 -top-2 size-5 rounded-full bg-slate-700" />
									<div className="mb-2 flex items-start">
										<StickyNote className="mr-2 mt-0.5 size-5 shrink-0 text-slate-400" />
										<h3 className="text-sm font-medium text-slate-300">Special Requests</h3>
									</div>
									<p className="pl-7 text-sm text-slate-400">{booking.specialRequests}</p>
								</div>
							)}
						</div>
					</div>
				</CardContent>
				<CardFooter className="flex justify-between bg-muted/50 py-4">
					<Button
						variant="outline"
						className="w-[48%]"
						onClick={handleReject}
						disabled={submitting}
					>
						<XCircle className="mr-2 size-4" />
						Reject
					</Button>
					<Button className="w-[48%]" onClick={handleAccept} disabled={submitting}>
						<CheckCircle className="mr-2 size-4" />
						Accept
					</Button>
				</CardFooter>
			</Card>

			{/* Accept Booking Modal */}
			<Dialog
				open={showAcceptModal}
				onOpenChange={(open) => !submitting && setShowAcceptModal(open)}
			>
				<DialogContent className="max-w-2xl">
					<DialogHeader>
						<DialogTitle>Accept Booking Request</DialogTitle>
						<DialogDescription>
							You are about to accept the booking request from {booking?.customerName}. Provide a
							quote and any additional notes.
						</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4">
						<div className="space-y-4">
							<div className="grid grid-cols-2 items-end gap-4">
								<div className="space-y-2">
									<Label htmlFor="quoteType">Quote Type</Label>
									<Select
										value={quoteType}
										onValueChange={(value) => setQuoteType(value as "fixed" | "hourly")}
									>
										<SelectTrigger>
											<SelectValue placeholder="Select quote type" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="fixed">Fixed Rate</SelectItem>
											<SelectItem value="hourly">Hourly Rate</SelectItem>
										</SelectContent>
									</Select>
								</div>
								<div className="space-y-2">
									<Label htmlFor="quoteAmount">Quote Amount (£)</Label>
									<div className="relative">
										<span className="absolute left-3 top-2.5 text-muted-foreground">£</span>
										<Input
											id="quoteAmount"
											type="number"
											min="0"
											step="0.01"
											placeholder="0.00"
											className="pl-7"
											value={quoteAmount}
											onChange={(e) => setQuoteAmount(e.target.value)}
											required
										/>
									</div>
								</div>
							</div>

							<div className="space-y-2">
								<AITextArea
									label="Additional Notes (Optional)"
									placeholder="Add any notes about this booking..."
									value={note}
									onChange={setNote}
									minHeight={100}
									maxHeight={200}
									bookingContext={{
										customerName: booking.customerName,
										vehicleType: booking.vehicleType,
										pickupLocation:
											typeof booking.pickupLocation === "string"
												? booking.pickupLocation
												: booking.pickupLocation?.city && booking.pickupLocation?.postcode
													? `${booking.pickupLocation.city}, ${booking.pickupLocation.postcode}`
													: "Location not specified",
										dropoffLocation:
											typeof booking.dropoffLocation === "string"
												? booking.dropoffLocation
												: booking.dropoffLocation?.city && booking.dropoffLocation?.postcode
													? `${booking.dropoffLocation.city}, ${booking.dropoffLocation.postcode}`
													: "Location not specified",
										pickupTime: booking.pickupTime,
										passengers: booking.passengers,
										specialRequests: booking.specialRequests || undefined,
										estimatedDuration: booking.estimatedDuration,
									}}
								/>
							</div>
						</div>
					</div>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setShowAcceptModal(false)}
							disabled={submitting}
						>
							Cancel
						</Button>
						<Button onClick={confirmAccept} disabled={!quoteAmount.trim() || submitting}>
							{submitting ? "Submitting..." : "Submit Quote"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Reject Booking Modal */}
			<Dialog
				open={showRejectModal}
				onOpenChange={(open) => !submitting && setShowRejectModal(open)}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Reject Booking Request</DialogTitle>
						<DialogDescription>
							You are about to reject the booking request from {booking?.customerName}. Please
							provide a reason for rejection.
						</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						<AITextArea
							label="Reason for Rejection"
							placeholder="Please provide a reason for rejection..."
							value={note}
							onChange={setNote}
							minHeight={100}
							maxHeight={200}
							required
							bookingContext={{
								customerName: booking.customerName,
								vehicleType: booking.vehicleType,
								pickupLocation:
									typeof booking.pickupLocation === "string"
										? booking.pickupLocation
										: booking.pickupLocation?.city && booking.pickupLocation?.postcode
											? `${booking.pickupLocation.city}, ${booking.pickupLocation.postcode}`
											: "Location not specified",
								dropoffLocation:
									typeof booking.dropoffLocation === "string"
										? booking.dropoffLocation
										: booking.dropoffLocation?.city && booking.dropoffLocation?.postcode
											? `${booking.dropoffLocation.city}, ${booking.dropoffLocation.postcode}`
											: "Location not specified",
								pickupTime: booking.pickupTime,
								passengers: booking.passengers,
								specialRequests: booking.specialRequests || undefined,
								estimatedDuration: booking.estimatedDuration,
							}}
						/>
					</div>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setShowRejectModal(false)}
							disabled={submitting}
						>
							Cancel
						</Button>
						<Button
							variant="destructive"
							onClick={confirmReject}
							disabled={!note.trim() || submitting}
						>
							{submitting ? "Submitting..." : "Confirm Reject"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Success Modal */}
			<Dialog
				open={successModal.show}
				onOpenChange={(open) => setSuccessModal({ ...successModal, show: open })}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>
							{successModal.type === "accept" ? "Booking Accepted" : "Booking Rejected"}
						</DialogTitle>
					</DialogHeader>
					<div className="flex flex-col items-center justify-center py-6">
						{successModal.type === "accept" ? (
							<>
								<div className="mb-4 flex size-20 items-center justify-center rounded-full bg-green-50">
									<CheckCircle className="size-10 text-green-500" />
								</div>
								<p className="text-center font-medium">Quote Submitted Successfully</p>
								<p className="mt-2 text-center text-sm text-muted-foreground">
									The customer will be notified of your quote and you will receive confirmation
									shortly.
								</p>
							</>
						) : (
							<>
								<div className="mb-4 flex size-20 items-center justify-center rounded-full bg-red-50">
									<XCircle className="size-10 text-red-500" />
								</div>
								<p className="text-center font-medium">Booking Rejected</p>
								<p className="mt-2 text-center text-sm text-muted-foreground">
									We have notified the customer that you are unable to accept this booking.
								</p>
							</>
						)}
					</div>
					<DialogFooter>
						<Button
							onClick={() => setSuccessModal({ ...successModal, show: false })}
							className="w-full"
						>
							Close
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
};
