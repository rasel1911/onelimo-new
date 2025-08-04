import { BookingRequest } from "@/db/schema/bookingRequest.schema";
import { formatLocation } from "@/lib/utils/formatting";
import {
	CustomerEmailTemplateContext,
	QuoteSummaryEmailProps,
} from "@/lib/workflow/types/communication";

export const buildQuoteSummaryProps = (
	context: CustomerEmailTemplateContext,
): QuoteSummaryEmailProps => {
	const { bookingRequest, selectedQuotes, totalQuotes, quotesUrl, companyName } = context;

	const pickupTime = new Date(bookingRequest.pickupTime);
	const bookingDate = pickupTime.toLocaleDateString("en-US", {
		weekday: "long",
		year: "numeric",
		month: "long",
		day: "numeric",
	});
	const bookingTimeStr = pickupTime.toLocaleTimeString("en-US", {
		hour: "2-digit",
		minute: "2-digit",
	});

	const pickupAddress = formatLocation(bookingRequest.pickupLocation);
	const dropoffAddress = formatLocation(bookingRequest.dropoffLocation);

	const quotesWithAmounts = selectedQuotes.filter((quote) => quote.amount && quote.amount > 0);
	const bestQuoteAmount =
		quotesWithAmounts.length > 0 ? Math.min(...quotesWithAmounts.map((q) => q.amount!)) : undefined;
	const averageQuoteAmount =
		quotesWithAmounts.length > 0
			? Math.round(
					quotesWithAmounts.reduce((sum, q) => sum + (q.amount || 0), 0) / quotesWithAmounts.length,
				)
			: undefined;

	return {
		customerName: bookingRequest.customerName,
		bookingId: bookingRequest.requestCode,
		serviceType: bookingRequest.vehicleType,
		bookingDate,
		bookingTime: bookingTimeStr,
		pickupAddress,
		dropoffAddress,
		vehicleType: bookingRequest.vehicleType,
		passengerCount: bookingRequest.passengers,
		quotesAvailable: selectedQuotes.length,
		totalQuotesReceived: totalQuotes,
		bestQuoteAmount,
		averageQuoteAmount,
		quotesUrl: quotesUrl || "",
		companyName,
		supportEmail: context.supportEmail,
	};
};

class CustomerEmailBuilder {
	static buildBookingConfirmationProps(
		bookingRequest: BookingRequest,
		companyName: string = "Onelimo",
		supportEmail?: string,
	): any {
		const pickupTime = new Date(bookingRequest.pickupTime);
		const dropoffTime = new Date(bookingRequest.estimatedDropoffTime);

		const bookingDate = pickupTime.toLocaleDateString("en-US", {
			weekday: "long",
			year: "numeric",
			month: "long",
			day: "numeric",
		});

		const pickupTimeStr = pickupTime.toLocaleTimeString("en-US", {
			hour: "2-digit",
			minute: "2-digit",
		});

		const dropoffTimeStr = dropoffTime.toLocaleTimeString("en-US", {
			hour: "2-digit",
			minute: "2-digit",
		});

		const durationHours = Math.floor(bookingRequest.estimatedDuration / 60);
		const durationMinutes = bookingRequest.estimatedDuration % 60;
		const estimatedDuration =
			durationHours > 0 ? `${durationHours}h ${durationMinutes}m` : `${durationMinutes}m`;

		const pickupAddress = formatLocation(bookingRequest.pickupLocation);
		const dropoffAddress = formatLocation(bookingRequest.dropoffLocation);

		const serviceType = this.determineServiceType(bookingRequest.vehicleType);

		return {
			customerName: bookingRequest.customerName,
			bookingId: bookingRequest.requestCode,

			serviceType,
			bookingDate,
			bookingTime: pickupTimeStr,
			estimatedDuration,

			pickupAddress,
			pickupTime: pickupTimeStr,
			dropoffAddress,
			dropoffTime: dropoffTimeStr,

			vehicleType: bookingRequest.vehicleType,
			passengerCount: bookingRequest.passengers,

			specialNotes: bookingRequest.specialRequests || undefined,

			status: "pending",

			companyName,
			supportEmail,

			viewBookingUrl: `/my-bookings/${bookingRequest.id}`,
			cancelBookingUrl: `/my-bookings/${bookingRequest.id}/cancel`,
		};
	}

	/**
	 * Build props for customer booking update email
	 */
	static buildBookingUpdateProps(
		bookingRequest: BookingRequest,
		status: "confirmed" | "cancelled",
		providerInfo?: {
			name: string;
			phone: string;
			email: string;
		},
		estimatedCost?: number,
		companyName: string = "Onelimo",
		supportEmail?: string,
	): any {
		const baseProps = this.buildBookingConfirmationProps(bookingRequest, companyName, supportEmail);

		return {
			...baseProps,
			status,
			providerName: providerInfo?.name,
			providerPhone: providerInfo?.phone,
			providerEmail: providerInfo?.email,
			estimatedCost,
			contactProviderUrl: providerInfo ? `/contact-provider/${bookingRequest.id}` : undefined,
		};
	}

	/**
	 * Build preview text for customer emails
	 */
	static buildCustomerPreviewText(
		bookingRequest: BookingRequest,
		status: "confirmed" | "pending" | "cancelled",
	): string {
		const statusText = {
			confirmed: "Your booking has been confirmed",
			pending: "Your booking request has been received",
			cancelled: "Your booking has been cancelled",
		}[status];

		return `${statusText} - ${bookingRequest.requestCode}`;
	}

	/**
	 * Determine service type based on vehicle type
	 */
	private static determineServiceType(vehicleType: string): string {
		const baseType = vehicleType.toLowerCase();

		if (baseType.includes("taxi") || baseType.includes("car")) {
			return "Taxi Service";
		} else if (baseType.includes("executive") || baseType.includes("luxury")) {
			return "Executive Transport";
		} else if (baseType.includes("van") || baseType.includes("minibus")) {
			return "Group Transport";
		} else if (baseType.includes("coach") || baseType.includes("bus")) {
			return "Coach Service";
		} else {
			return "Transport Service";
		}
	}
}

export default CustomerEmailBuilder;
