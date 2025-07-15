import { ConfirmationSMSData } from "@/lib/workflow/types/confirmation";

export const generateProviderConfirmationSMS = (data: ConfirmationSMSData): string => {
	return `BOOKING CONFIRMED: ${data.customerName} has confirmed their ${data.vehicleType} booking.

From: ${data.pickupAddress}
To: ${data.dropoffAddress}
Amount: £${data.confirmedAmount}

Customer will contact you closer to pickup time. Booking ID: ${data.bookingId}`;
};

export const generateCustomerConfirmationSMS = (data: ConfirmationSMSData): string => {
	return `Your booking is CONFIRMED! 🎉

Provider: ${data.providerName}
Date: ${data.bookingDate} at ${data.bookingTime}
From: ${data.pickupAddress}
To: ${data.dropoffAddress}
Total: £${data.confirmedAmount}

Your driver will contact you closer to pickup time. Booking ID: ${data.bookingId}`;
};

export const generateUrgentProviderConfirmationSMS = (data: ConfirmationSMSData): string => {
	return `CONFIRMED: ${data.customerName} - ${data.vehicleType} - ${data.bookingDate} ${data.bookingTime}
${data.pickupAddress} → ${data.dropoffAddress}
£${data.confirmedAmount} | ID: ${data.bookingId}`;
};

export const generateUrgentCustomerConfirmationSMS = (data: ConfirmationSMSData): string => {
	return `Confirmed! ${data.providerName} - ${data.bookingDate} ${data.bookingTime}
${data.pickupAddress} → ${data.dropoffAddress} | £${data.confirmedAmount}`;
};
