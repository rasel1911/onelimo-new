"use client";

import { CheckCircle, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { toggleServiceProviderStatusAction } from "@/app/(dashboard)/admin/service-providers/actions";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

interface ToggleServiceProviderStatusProps {
	id: string;
	currentStatus: string;
	onStatusChanged?: () => void;
}

export const ToggleServiceProviderStatus = ({
	id,
	currentStatus,
	onStatusChanged,
}: ToggleServiceProviderStatusProps) => {
	const [isToggling, setIsToggling] = useState(false);

	const isActive = currentStatus === "active";
	const actionText = isActive ? "Make Unavailable" : "Make Available";
	const icon = isActive ? XCircle : CheckCircle;
	const Icon = icon;

	async function handleToggleStatus() {
		try {
			setIsToggling(true);
			const result = await toggleServiceProviderStatusAction(id, currentStatus);

			if (result.success) {
				toast.success(result.message);
				onStatusChanged?.();
			} else {
				toast.error(result.error || "Failed to update service provider status");
			}
		} catch (error) {
			toast.error("Something went wrong. Please try again.");
		} finally {
			setIsToggling(false);
		}
	}

	return (
		<DropdownMenuItem
			onClick={handleToggleStatus}
			disabled={isToggling}
			className={`cursor-pointer ${
				isActive
					? "text-orange-600 hover:text-orange-600 focus:text-orange-600"
					: "text-green-600 hover:text-green-600 focus:text-green-600"
			}`}
		>
			<Icon className="mr-2 size-4" />
			{isToggling ? "Updating..." : actionText}
		</DropdownMenuItem>
	);
};
