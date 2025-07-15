"use client";

import { Car, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Suspense } from "react";

import { BookingForm } from "@/app/(booking)/booking-request-form/components/booking-form";
import { BookingFormSkeleton } from "@/app/(booking)/booking-request-form/components/booking-form-skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const BookingRequestPage = () => {
	const router = useRouter();
	const { toast } = useToast();

	const handleBookingSuccess = (requestCode: string) => {
		toast({
			title: "Booking Request Submitted!",
			description: `Your booking request ${requestCode} has been submitted successfully.`,
		});

		router.push(`/booking-request-form/success?code=${requestCode}`);
	};

	return (
		<div className="container mx-auto flex min-h-screen max-w-4xl items-center justify-center px-4 py-8">
			<div className="w-full">
				<div className="mb-2">
					<Link href="/" passHref>
						<Button variant="outline" size="sm" className="mb-4">
							<ArrowLeft className="mr-2 size-4" />
							Back to Home
						</Button>
					</Link>
				</div>
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Car className="size-5" />
							Booking Request
						</CardTitle>
						<CardDescription>
							Please provide your journey details to receive quotes from our service providers.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Suspense fallback={<BookingFormSkeleton />}>
							<BookingForm onSuccess={handleBookingSuccess} />
						</Suspense>
					</CardContent>
				</Card>
			</div>
		</div>
	);
};

export default BookingRequestPage;
