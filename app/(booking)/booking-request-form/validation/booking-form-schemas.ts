import { z } from "zod";

const VEHICLE_TYPES = [
	"premium_suv",
	"party_bus",
	"stretch_limousine",
	"luxury_sedan",
	"hummer",
	"other",
] as const;

export const UK_POSTCODE_REGEX = /^[A-Z]{1,2}[0-9]{1,2}[A-Z]?\s?[0-9][A-Z]{2}$/i;
export const EU_POSTCODE_REGEX = /^[0-9]{4,5}$/;

const postcodeSchema = z
	.string()
	.min(1, "Postcode is required")
	.refine(
		(value) => UK_POSTCODE_REGEX.test(value.replace(/\s/g, "")),
		"Please enter a valid postcode (e.g. SW1A 1AA)",
	);

const citySchema = z
	.string()
	.min(1, "City is required")
	.min(2, "City name must be at least 2 characters")
	.max(50, "City name must be less than 50 characters")
	.regex(
		/^[a-zA-Z\s\-']+$/,
		"City name can only contain letters, spaces, hyphens, and apostrophes",
	);

const dateTimeSchema = z
	.string()
	.min(1, "Date and time is required")
	.refine((value) => {
		const date = new Date(value);
		return !isNaN(date.getTime());
	}, "Please enter a valid date and time")
	.refine((value) => {
		const date = new Date(value);
		const now = new Date();
		const minimumFutureTime = new Date(now.getTime() + 30 * 60 * 1000); // 30 minutes from now
		return date > minimumFutureTime;
	}, "Pickup time must be at least 30 minutes from now")
	.refine((value) => {
		const date = new Date(value);
		const oneYearFromNow = new Date();
		oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
		return date <= oneYearFromNow;
	}, "Booking date cannot be more than 1 year in the future");

const baseBookingSchema = z.object({
	pickupCity: citySchema,
	pickupPostcode: postcodeSchema,
	dropoffCity: citySchema,
	dropoffPostcode: postcodeSchema,
	pickupTime: dateTimeSchema,
	estimatedDropoffTime: dateTimeSchema,
	estimatedDuration: z
		.number()
		.min(1, "Duration must be at least 1 minute")
		.max(1440, "Duration cannot exceed 24 hours"),
	passengers: z
		.number()
		.min(1, "At least 1 passenger is required")
		.max(50, "Maximum 50 passengers allowed"),
	vehicleType: z.enum(VEHICLE_TYPES, {
		errorMap: () => ({ message: "Please select a valid vehicle type" }),
	}),
	customVehicleType: z
		.string()
		.max(100, "Custom vehicle type must be less than 100 characters")
		.optional(),
	specialRequests: z
		.string()
		.max(500, "Special requests must be less than 500 characters")
		.optional(),
});

export const bookingFormSchema = baseBookingSchema
	.refine(
		(data) => {
			const pickupDate = new Date(data.pickupTime);
			const dropoffDate = new Date(data.estimatedDropoffTime);
			return dropoffDate > pickupDate;
		},
		{
			message: "Dropoff time must be after pickup time",
			path: ["estimatedDropoffTime"],
		},
	)
	.refine(
		(data) => {
			const pickupLocation = `${data.pickupCity} ${data.pickupPostcode}`.toLowerCase();
			const dropoffLocation = `${data.dropoffCity} ${data.dropoffPostcode}`.toLowerCase();
			return pickupLocation !== dropoffLocation;
		},
		{
			message: "Pickup and dropoff locations must be different",
			path: ["dropoffCity"],
		},
	)
	.refine(
		(data) => {
			if (data.vehicleType === "other") {
				return data.customVehicleType && data.customVehicleType.trim().length > 0;
			}
			return true;
		},
		{
			message: "Please specify your custom vehicle type",
			path: ["customVehicleType"],
		},
	);

export type BookingFormData = z.infer<typeof bookingFormSchema>;

export const createBookingSchema = baseBookingSchema
	.extend({
		userId: z.string().uuid("Invalid user ID"),
		customerName: z.string().min(1, "Customer name is required"),
	})
	.refine(
		(data) => {
			// Ensure dropoff time is after pickup time
			const pickupDate = new Date(data.pickupTime);
			const dropoffDate = new Date(data.estimatedDropoffTime);
			return dropoffDate > pickupDate;
		},
		{
			message: "Dropoff time must be after pickup time",
			path: ["estimatedDropoffTime"],
		},
	)
	.refine(
		(data) => {
			// Ensure pickup and dropoff locations are different
			const pickupLocation = `${data.pickupCity} ${data.pickupPostcode}`.toLowerCase();
			const dropoffLocation = `${data.dropoffCity} ${data.dropoffPostcode}`.toLowerCase();
			return pickupLocation !== dropoffLocation;
		},
		{
			message: "Pickup and dropoff locations must be different",
			path: ["dropoffCity"],
		},
	)
	.refine(
		(data) => {
			if (data.vehicleType === "other") {
				return data.customVehicleType && data.customVehicleType.trim().length > 0;
			}
			return true;
		},
		{
			message: "Please specify your custom vehicle type",
			path: ["customVehicleType"],
		},
	);

export type CreateBookingData = z.infer<typeof createBookingSchema>;
