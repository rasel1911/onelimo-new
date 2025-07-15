"use client";

import { CheckCircle, Calendar, Car } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { Button } from "@/components/ui/button";

const BookingSuccessContent = () => {
	const searchParams = useSearchParams();
	const requestCode = searchParams.get("code");

	return (
		<div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
			<div className="container mx-auto px-6">
				<div className="mx-auto max-w-2xl space-y-5 text-center">
					{/* Success Icon */}
					<div className="mb-4 flex justify-center">
						<div className="flex size-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
							<CheckCircle className="size-10 text-green-600 dark:text-green-400" />
						</div>
					</div>

					{/* Success Message */}
					<div>
						<h1 className="mb-4 font-bold text-foreground md:text-3xl">
							Booking Request Received!
						</h1>
						<p className="mb-8 text-muted-foreground">
							Your booking request has been received. We&apos;ll take care of everything from here.
						</p>
					</div>

					{/* Booking Details Card */}
					<div className="space-y-6 rounded-3xl border border-border bg-card p-8 shadow-sm">
						<div className="text-left">
							<h2 className="mb-6 text-center text-2xl font-semibold">Booking Details</h2>

							{true && (
								<div className="flex justify-between mb-4 rounded-xl bg-primary/10 p-4">
									<div className="font-medium text-muted-foreground">
										Booking Reference
									</div>
									<div className="font-mono font-bold text-primary">
										#{requestCode}
									</div>
								</div>
							)}

							<div className="space-y-4">
								<div className="flex items-start space-x-3">
									<div className="mt-1 flex size-8 items-center justify-center rounded-full bg-primary/10">
										<Calendar className="size-4 text-primary" />
									</div>
									<div>
										<div className="font-medium">What&apos;s Next?</div>
										<div className="text-sm text-muted-foreground">
											We will now be finding the best providers for your journey. You&apos;ll
											receive notifications as your booking progresses.
										</div>
									</div>
								</div>
								<div className="flex items-start space-x-3">
									<div className="mt-1 flex size-8 items-center justify-center rounded-full bg-primary/10">
										<Car className="size-4 text-primary" />
									</div>
									<div>
										<div className="font-medium">Provider Match</div>
										<div className="text-sm text-muted-foreground">
											We&apos;ll connect you with qualified providers in your area shortly.
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Action Buttons */}
					<div className="flex flex-col justify-center gap-4 sm:flex-row">
						<Link href="/booking-request-form">
							<Button
								size="lg"
								variant="outline"
								className="w-full rounded-2xl border-2 px-8 py-6 transition-all duration-300 hover:bg-primary/5 sm:w-auto"
							>
								Book Another Ride
							</Button>
						</Link>
					</div>

					{/* Additional Info */}
					<div className="pt-8 text-center">
						<p className="text-sm text-muted-foreground">
							Need help? Contact us at{" "}
							<a href="mailto:help@onelimo.co.uk" className="text-primary hover:underline">
								help@onelimo.co.uk
							</a>
						</p>
					</div>
				</div>
			</div>
		</div>
	);
};

const LoadingFallback = () => {
	return (
		<div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
			<div className="container mx-auto px-6">
				<div className="mx-auto max-w-2xl space-y-8 text-center">
					{/* Success Icon */}
					<div className="mb-8 flex justify-center">
						<div className="flex size-24 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
							<CheckCircle className="size-12 text-green-600 dark:text-green-400" />
						</div>
					</div>

					{/* Success Message */}
					<div>
						<h1 className="mb-4 text-4xl font-bold text-foreground md:text-5xl">
							Booking Request Received!
						</h1>
						<p className="mb-8 text-xl text-muted-foreground">
							Your booking request has been received. We&apos;ll take care of everything from here.
						</p>
					</div>

					{/* Loading state for booking details */}
					<div className="space-y-6 rounded-3xl border border-border/50 bg-card p-8 shadow-sm">
						<div className="text-left">
							<h2 className="mb-6 text-center text-2xl font-semibold">Booking Details</h2>
							<div className="animate-pulse space-y-4">
								<div className="h-4 w-3/4 rounded bg-muted"></div>
								<div className="h-4 w-1/2 rounded bg-muted"></div>
							</div>
						</div>
					</div>

					{/* Action Buttons */}
					<div className="flex flex-col justify-center gap-4 sm:flex-row">
						<Link href="/booking-request">
							<Button
								size="lg"
								variant="outline"
								className="w-full rounded-2xl border-2 px-8 py-6 transition-all duration-300 hover:bg-primary/5 sm:w-auto"
							>
								Book Another Ride
							</Button>
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
};

const BookingSuccessPage = () => {
	return (
		<Suspense fallback={<LoadingFallback />}>
			<BookingSuccessContent />
		</Suspense>
	);
};

export default BookingSuccessPage;
