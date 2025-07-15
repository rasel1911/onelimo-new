import { motion } from "framer-motion";
import { Loader2, CheckCircle, XCircle, MapPin, Calendar, Users, Car } from "lucide-react";

import { ToolIndicatorProps } from "../types";

const toolIcons = {
	validateLocation: MapPin,
	validateDateTime: Calendar,
	updateBookingSession: Users,
	confirmBooking: Car,
	resetBookingSession: XCircle,
} as const;

const toolLabels = {
	validateLocation: "Validating location",
	validateDateTime: "Validating date & time",
	updateBookingSession: "Processing",
	confirmBooking: "Confirming booking",
	resetBookingSession: "Resetting session",
} as const;

export const ToolIndicator = ({ toolName, status, args }: ToolIndicatorProps) => {
	const IconComponent = toolIcons[toolName as keyof typeof toolIcons] || Car;
	const label = toolLabels[toolName as keyof typeof toolLabels] || "Processing";

	const getStatusIcon = () => {
		switch (status) {
			case "pending":
				return <Loader2 className="size-4 animate-spin text-blue-800" />;
			case "error":
				return <XCircle className="size-4 text-red-500" />;
			default:
				return <CheckCircle className="size-4 text-primary" />;
		}
	};

	const getStatusColor = () => {
		switch (status) {
			case "pending":
				return "border-blue-800 bg-background/80";
			case "error":
				return "border-red-800 bg-background/80";
			default:
				return "border-primary bg-background/80";
		}
	};

	const getDetails = () => {
		if (toolName === "validateLocation" && args) {
			return `${args.cityName}${args.postCode ? ` (${args.postCode})` : ""}`;
		}
		if (toolName === "validateDateTime" && args) {
			return `${args.type} time`;
		}
		if (toolName === "updateBookingSession" && args) {
			const details = [];
			if (args.pickupLocation) details.push(`pickup: ${args.pickupLocation.cityName}`);
			if (args.dropoffLocation) details.push(`dropoff: ${args.dropoffLocation.cityName}`);
			if (args.passengers) details.push(`${args.passengers} passengers`);
			if (args.vehicleType) details.push(args.vehicleType);
			if (args.pickupDateTime) details.push("pickup time");
			if (args.dropoffDateTime) details.push("dropoff time");
			return details.join(", ") || "Session data";
		}
		if (toolName === "confirmBooking") {
			return "Confirming booking request";
		}
		if (toolName === "resetBookingSession") {
			return "Starting fresh";
		}
		return "";
	};

	return (
		<motion.div
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${getStatusColor()}`}
		>
			<IconComponent className="size-4 text-muted-foreground" />
			<span className="font-medium">{label}</span>
			{getDetails() && <span className="text-muted-foreground">• {getDetails()}</span>}
			{getStatusIcon()}
		</motion.div>
	);
};
