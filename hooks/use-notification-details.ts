import { useState, useEffect, useCallback } from "react";

import { ProviderNotification } from "@/lib/workflow/types/notification";

interface UseNotificationDetailsReturn {
	providerDetails: ProviderNotification[];
	isLoading: boolean;
	error: string | null;
	refetch: () => void;
}

export function useNotificationDetails(
	workflowRunId: string | undefined,
	isOpen: boolean,
): UseNotificationDetailsReturn {
	const [providerDetails, setProviderDetails] = useState<ProviderNotification[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const loadProviderDetails = useCallback(async () => {
		if (!workflowRunId) return;

		setIsLoading(true);
		setError(null);

		try {
			const response = await fetch(`/api/workflow/${workflowRunId}/notifications`);

			if (!response.ok) {
				throw new Error("Failed to fetch notification details");
			}

			const notificationData = await response.json();
			setProviderDetails(notificationData.notifications || []);
		} catch (err) {
			console.error("Error loading provider details:", err);
			setError(err instanceof Error ? err.message : "Failed to load provider details");
		} finally {
			setIsLoading(false);
		}
	}, [workflowRunId]);

	useEffect(() => {
		if (isOpen && workflowRunId) {
			loadProviderDetails();
		}
	}, [isOpen, workflowRunId, loadProviderDetails]);

	return {
		providerDetails,
		isLoading,
		error,
		refetch: loadProviderDetails,
	};
}
