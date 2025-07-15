import { CalendarClock } from "lucide-react";
import { notFound } from "next/navigation";

import { ReceivedBookingRequest } from "@/app/(booking)/bq/components/received-booking-request";
import { getWorkflowProviderLinkData } from "@/db/queries/workflow/workflowProvider.queries";
import { decodeProviderLinkFromData } from "@/lib/workflow/algorithms/linkGenerator";
import { DecodedProviderLink } from "@/lib/workflow/types/provider-link";

import { PinProtectedWrapper } from "./pin-protected-wrapper";

interface BookingRequestPageProps {
	params: {
		bookingReqHash: string;
	};
}

export default async function BookingRequestPage({ params }: BookingRequestPageProps) {
	const { bookingReqHash } = params;
	console.log("🔑 bookingReqHash", bookingReqHash);

	if (!bookingReqHash) {
		notFound();
	}

	try {
		const providerData = await getWorkflowProviderLinkData(bookingReqHash);

		if (!providerData || providerData.length === 0) {
			notFound();
		}

		const provider = providerData[0];

		let decodedLinkData: DecodedProviderLink;
		try {
			decodedLinkData = await decodeProviderLinkFromData(provider.linkEncryptedData!);
			console.log("🔑 decodedLinkData", decodedLinkData);
		} catch (error) {
			console.error("Error decoding link data:", error);
			notFound();
		}

		if (provider.linkExpiresAt && new Date() > provider.linkExpiresAt) {
			return (
				<PinProtectedWrapper providerId={decodedLinkData.providerId}>
					<div className="container flex min-h-[calc(100vh-4rem)] items-center justify-center">
						<div className="w-full max-w-2xl py-8 text-center">
							<div className="mb-8">
								<CalendarClock className="mx-auto mb-4 size-12 text-muted-foreground" />
								<h1 className="text-2xl font-bold text-destructive">Link Expired</h1>
								<p className="mt-2 text-muted-foreground">
									This booking request link has expired. Please contact support for assistance.
								</p>
							</div>
						</div>
					</div>
				</PinProtectedWrapper>
			);
		}

		return (
			<PinProtectedWrapper providerId={decodedLinkData.providerId}>
				<div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
					<div className="w-full max-w-2xl py-8">
						<div className="mb-8 text-center">
							<h1 className="text-2xl font-bold">Booking Request</h1>
							<p className="mt-2 text-muted-foreground">
								Review and respond to this ride request from a customer.
							</p>
						</div>
						<ReceivedBookingRequest bookingReqHash={bookingReqHash} />
					</div>
				</div>
			</PinProtectedWrapper>
		);
	} catch (error) {
		console.error("Error loading booking request:", error);
		notFound();
	}
}
