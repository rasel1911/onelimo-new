"use client";

import { useState, useEffect, useCallback } from "react";

import { WorkflowTrackingData, WorkflowTrackingResponse } from "@/lib/types/workflow-tracking";

interface UseWorkflowTrackingOptions {
	enablePolling?: boolean;
	lazy?: boolean;
	specificBookingId?: string;
}

interface UseWorkflowTrackingReturn {
	data: WorkflowTrackingData[];
	isLoading: boolean;
	isError: boolean;
	error: string | null;
	refetch: () => Promise<void>;
	startFetching: () => void;
}

export const useWorkflowTracking = (
	options: UseWorkflowTrackingOptions = {},
): UseWorkflowTrackingReturn => {
	const { enablePolling = true, lazy = false, specificBookingId } = options;

	const [data, setData] = useState<WorkflowTrackingData[]>([]);
	const [isLoading, setIsLoading] = useState(!lazy);
	const [isError, setIsError] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [fetchingEnabled, setFetchingEnabled] = useState(!lazy);

	const fetchWorkflowTracking = useCallback(async () => {
		if (!fetchingEnabled) return;

		try {
			setIsLoading(true);
			setIsError(false);
			setError(null);

			const url = new URL("/api/workflow-tracking", window.location.origin);
			if (specificBookingId) {
				url.searchParams.set("bookingId", specificBookingId);
			}
			console.log("fetching workflow tracking", url.toString());

			const response = await fetch(url.toString(), {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
			});

			console.log("response", response);

			if (!response.ok) {
				throw new Error(`Failed to fetch workflow data: ${response.status}`);
			}

			const result: WorkflowTrackingResponse = await response.json();

			setData([...result.workflowTracking]);
		} catch (err) {
			console.error("Error fetching workflow tracking data:", err);
			setIsError(true);
			setError(err instanceof Error ? err.message : "Failed to fetch workflow data");
		} finally {
			setIsLoading(false);
		}
	}, [fetchingEnabled, specificBookingId]);

	useEffect(() => {
		if (fetchingEnabled) {
			fetchWorkflowTracking();
		}
	}, [fetchWorkflowTracking, fetchingEnabled]);

	useEffect(() => {
		if (!enablePolling || !fetchingEnabled) return;

		const THIRTY_MINUTES = 30 * 60 * 1000; // 30 minutes in milliseconds

		const interval = setInterval(() => {
			fetchWorkflowTracking();
		}, THIRTY_MINUTES);

		return () => clearInterval(interval);
	}, [enablePolling, fetchWorkflowTracking, fetchingEnabled]);

	const refetch = useCallback(async () => {
		await fetchWorkflowTracking();
	}, [fetchWorkflowTracking]);

	const startFetching = useCallback(() => {
		if (!fetchingEnabled) {
			setFetchingEnabled(true);
		}
	}, [fetchingEnabled]);

	return {
		data,
		isLoading,
		isError,
		error,
		refetch,
		startFetching,
	};
};
