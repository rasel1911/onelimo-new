"use client";

import { Badge } from "@/components/ui/badge";
import { formatStatusText } from "@/lib/utils/formatting";

interface StatusBadgeProps {
	status: string;
	variant?: "default" | "outline" | "destructive" | "secondary";
}

export function StatusBadge({ status, variant }: StatusBadgeProps) {
	const getStatusVariant = (status: string): StatusBadgeProps["variant"] => {
		const normalizedStatus = status.toLowerCase();

		switch (normalizedStatus) {
			case "completed":
			case "sent":
			case "delivered":
			case "accepted":
				return "default";
			case "in-progress":
			case "pending":
				return "outline";
			case "failed":
			case "declined":
				return "destructive";
			default:
				return variant || "outline";
		}
	};

	return <Badge variant={getStatusVariant(status)}>{formatStatusText(status)}</Badge>;
}
