/**
 * Quote Available SMS Template
 *
 * SMS template for notifying customers when service provider quotes are ready.
 * Provides urgent notification with quote count and link to view details,
 * optimized for mobile viewing and quick action.
 */

import { CustomerSMSTemplateContext } from "@/lib/workflow/types/communication";

export const generateQuoteAvailableSMS = (context: CustomerSMSTemplateContext): string => {
	const { bookingRequest, selectedQuotes, shortUrl } = context;
	const pickup = bookingRequest.pickupLocation;
	const dropoff = bookingRequest.dropoffLocation;

	const pickupTime = new Date(bookingRequest.pickupTime);
	const dateStr = pickupTime.toLocaleDateString("en-GB", {
		weekday: "short",
		day: "numeric",
		month: "short",
	});
	const timeStr = pickupTime.toLocaleTimeString("en-GB", {
		hour: "2-digit",
		minute: "2-digit",
	});

	const quoteCount = selectedQuotes.length;
	const quoteText = quoteCount === 1 ? "quote is" : "quotes are";

	const quotesWithAmounts = selectedQuotes.filter((quote) => quote.amount && quote.amount > 0);
	const bestPrice =
		quotesWithAmounts.length > 0 ? Math.min(...quotesWithAmounts.map((q) => q.amount!)) : null;

	const priceText = bestPrice ? ` from £${bestPrice}` : "";

	return `Hi! ${quoteCount} ${quoteText} ready for your ${bookingRequest.vehicleType} booking${priceText}.

${dateStr} ${timeStr}: ${pickup.city} to ${dropoff.city}

View & select: ${shortUrl}`;
};

export const generateUrgentQuoteAvailableSMS = (context: CustomerSMSTemplateContext): string => {
	const { bookingRequest, selectedQuotes, shortUrl } = context;
	const pickup = bookingRequest.pickupLocation;
	const dropoff = bookingRequest.dropoffLocation;

	const pickupTime = new Date(bookingRequest.pickupTime);
	const dateStr = pickupTime.toLocaleDateString("en-GB", {
		day: "numeric",
		month: "short",
	});
	const timeStr = pickupTime.toLocaleTimeString("en-GB", {
		hour: "2-digit",
		minute: "2-digit",
	});

	const quoteCount = selectedQuotes.length;

	const quotesWithAmounts = selectedQuotes.filter((quote) => quote.amount && quote.amount > 0);
	const bestPrice =
		quotesWithAmounts.length > 0 ? Math.min(...quotesWithAmounts.map((q) => q.amount!)) : null;

	const priceText = bestPrice ? ` from £${bestPrice}` : "";

	return `${quoteCount} quotes ready${priceText}! ${dateStr} ${timeStr}
${pickup.city} → ${dropoff.city}

Select: ${shortUrl}`;
};

export const generateQuoteReminderSMS = (context: CustomerSMSTemplateContext): string => {
	const { shortUrl } = context;

	return `Reminder: Your quotes expire soon. Please select your preferred option: ${shortUrl}`;
};
