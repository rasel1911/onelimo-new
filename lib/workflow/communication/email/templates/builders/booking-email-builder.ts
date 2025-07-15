import { formatStatusText } from "@/lib/utils/formatting";
import { BookingRequestEmailProps, ProviderEmailTemplateContext } from "@/lib/workflow/types/communication";

/**
 * Booking Email Builder
 * Transforms EmailTemplateContext into BookingRequestEmailProps
 */
class BookingEmailBuilder {
	static buildBookingRequestProps(context: ProviderEmailTemplateContext): BookingRequestEmailProps {
		const { bookingRequest, provider, analysis, urls, companyName } = context;

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

		const pickupAddress = `${bookingRequest.pickupLocation.city}, ${bookingRequest.pickupLocation.postcode}`;
		const dropoffAddress = `${bookingRequest.dropoffLocation.city}, ${bookingRequest.dropoffLocation.postcode}`;

		const serviceType = bookingRequest.vehicleType;
		const specialNotes = analysis.cleanedMessage || "No special notes";

		return {
			customerName: bookingRequest.customerName,
			providerName: provider.name,

			bookingId: bookingRequest.requestCode,
			serviceType,
			bookingDate,
			bookingTime: pickupTimeStr,
			estimatedDuration,

			pickupAddress,
			pickupTime: pickupTimeStr,
			dropoffAddress,
			dropoffTime: dropoffTimeStr,

			vehicleType: formatStatusText(bookingRequest.vehicleType),
			passengerCount: bookingRequest.passengers,

			specialNotes,

			acceptUrl: urls.accept,
			declineUrl: urls.decline,
			viewDetailsUrl: urls.viewDetails,

			companyName,

			urgency: analysis.urgency,
			cleanedMessage: analysis.cleanedMessage,
			keyPoints: analysis.keyPoints,
		};
	}

	/**
	 * Build preview text for the email
	 */
	static buildPreviewText(context: ProviderEmailTemplateContext): string {
		const { bookingRequest, analysis } = context;
		const urgencyPrefix = analysis.urgency === "high" ? "URGENT: " : "";
		return `${urgencyPrefix}New booking request from ${bookingRequest.customerName} - ${bookingRequest.vehicleType} service`;
	}
}

export default BookingEmailBuilder;
