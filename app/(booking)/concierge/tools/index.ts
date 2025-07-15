import { validateLocationTool } from "@/app/(booking)/concierge/tools/location-validation-tool";

import {
	updateBookingSessionTool,
	confirmBookingTool,
	resetBookingSessionTool,
} from "./booking-tools";
import { validateDateTimeTool } from "./datetime-validation";

export {
	updateBookingSessionTool,
	confirmBookingTool,
	resetBookingSessionTool,
} from "@/app/(booking)/concierge/tools/booking-tools";
export { validateDateTimeTool } from "./datetime-validation";

export { bookingInfoSchema } from "@/app/(booking)/concierge/tools/booking-tools";
export { LocationSchema } from "./location-validation-tool";

export const agentTools = {
	validateLocation: validateLocationTool,
	validateDateTime: validateDateTimeTool,
	updateBookingSession: updateBookingSessionTool,
	confirmBooking: confirmBookingTool,
	resetBookingSession: resetBookingSessionTool,
} as const;
