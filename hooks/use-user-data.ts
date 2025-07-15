import { useSession } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";

import { User } from "@/db/schema";

interface UserDataState {
	user: User | null;
	isLoading: boolean;
	error: string | null;
	isAuthenticated: boolean;
}

interface UseUserDataReturn extends UserDataState {
	refetch: () => Promise<void>;
}

const USER_DATA_CACHE_KEY = "onelimo-user-data";

export const useUserData = (): UseUserDataReturn => {
	const { data: session, status } = useSession();
	const [state, setState] = useState<UserDataState>({
		user: null,
		isLoading: true,
		error: null,
		isAuthenticated: false,
	});

	// Get cached user data from session storage
	const getCachedUserData = useCallback((): User | null => {
		if (typeof window === "undefined") return null;
		try {
			const cached = sessionStorage.getItem(USER_DATA_CACHE_KEY);
			return cached ? JSON.parse(cached) : null;
		} catch {
			return null;
		}
	}, []);

	// Set cached user data to session storage
	const setCachedUserData = useCallback((user: User | null) => {
		if (typeof window === "undefined") return;
		try {
			if (user) {
				sessionStorage.setItem(USER_DATA_CACHE_KEY, JSON.stringify(user));
			} else {
				sessionStorage.removeItem(USER_DATA_CACHE_KEY);
			}
		} catch {
			// Ignore storage errors
		}
	}, []);

	// Fetch user data from database
	const fetchUserData = useCallback(async (userId: string): Promise<User | null> => {
		try {
			const response = await fetch(`/api/users/${userId}`);
			if (!response.ok) {
				if (response.status === 401) {
					throw new Error("Please login to continue");
				}
				if (response.status === 404) {
					throw new Error("User not found");
				}
				throw new Error(`Failed to fetch user data: ${response.status}`);
			}
			const userData = await response.json();
			return userData;
		} catch (error) {
			console.error("Error fetching user data:", error);
			throw error;
		}
	}, []);

	// Main refetch function
	const refetch = useCallback(async () => {
		if (status === "loading") return;

		if (status === "unauthenticated" || !session?.user?.id) {
			setState({ user: null, isLoading: false, error: null, isAuthenticated: false });
			setCachedUserData(null);
			return;
		}

		setState((prev) => ({ ...prev, isLoading: true, error: null, isAuthenticated: true }));

		try {
			const userData = await fetchUserData(session.user.id);
			setState({ user: userData, isLoading: false, error: null, isAuthenticated: true });
			setCachedUserData(userData);
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : "Failed to fetch user data";
			setState({ user: null, isLoading: false, error: errorMessage, isAuthenticated: true });
		}
	}, [session?.user?.id, status, fetchUserData, setCachedUserData]);

	// Initialize user data
	useEffect(() => {
		if (status === "loading") {
			setState((prev) => ({ ...prev, isLoading: true }));
			return;
		}

		if (status === "unauthenticated" || !session?.user?.id) {
			setState({ user: null, isLoading: false, error: null, isAuthenticated: false });
			setCachedUserData(null);
			return;
		}

		// Try to get cached data first
		const cachedData = getCachedUserData();
		if (cachedData) {
			setState({ user: cachedData, isLoading: false, error: null, isAuthenticated: true });
			// Still fetch fresh data in the background
			refetch();
		} else {
			// No cached data, fetch from API
			refetch();
		}
	}, [session?.user?.id, status, getCachedUserData, refetch, setCachedUserData]);

	// Clear cache when session changes
	useEffect(() => {
		if (status === "unauthenticated") {
			setCachedUserData(null);
		}
	}, [status, setCachedUserData]);

	return {
		...state,
		refetch,
	};
};
