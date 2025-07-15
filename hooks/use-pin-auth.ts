import { useState, useEffect, useCallback } from "react";

interface PinAuthState {
	isAuthenticated: boolean;
	isLoading: boolean;
	providerId?: string;
	provider?: {
		id: string;
		name: string;
		email: string;
	};
	error?: string;
	sessionExpiresAt?: number;
}

interface PinAuthActions {
	checkSession: () => Promise<void>;
	logout: () => Promise<void>;
	clearError: () => void;
}

export const usePinAuth = (): PinAuthState & PinAuthActions => {
	const [state, setState] = useState<PinAuthState>({
		isAuthenticated: false,
		isLoading: true,
	});

	const checkSession = useCallback(async () => {
		try {
			setState((prev) => ({ ...prev, isLoading: true, error: undefined }));

			const response = await fetch("/provider-auth/api/validate-session", {
				credentials: "include",
			});

			const data = await response.json();

			if (data.success && data.valid) {
				setState({
					isAuthenticated: true,
					isLoading: false,
					providerId: data.session.providerId,
					provider: data.provider,
					sessionExpiresAt: data.session.expiresAt,
				});
			} else {
				setState({
					isAuthenticated: false,
					isLoading: false,
					error: data.error,
				});
			}
		} catch (error) {
			console.error("Session check failed:", error);
			setState({
				isAuthenticated: false,
				isLoading: false,
				error: "Failed to check authentication status",
			});
		}
	}, []);

	const logout = useCallback(async () => {
		try {
			await fetch("/provider-auth/api/logout", {
				method: "POST",
				credentials: "include",
			});

			setState({
				isAuthenticated: false,
				isLoading: false,
			});
		} catch (error) {
			console.error("Logout failed:", error);
			setState((prev) => ({
				...prev,
				error: "Failed to logout",
			}));
		}
	}, []);

	const clearError = useCallback(() => {
		setState((prev) => ({ ...prev, error: undefined }));
	}, []);

	useEffect(() => {
		checkSession();
	}, [checkSession]);

	useEffect(() => {
		if (state.isAuthenticated && state.sessionExpiresAt) {
			const timeUntilExpiry = state.sessionExpiresAt - Date.now();

			if (timeUntilExpiry > 0) {
				const timeoutId = setTimeout(() => {
					setState((prev) => ({
						...prev,
						isAuthenticated: false,
						error: "Session expired",
					}));
				}, timeUntilExpiry);

				return () => clearTimeout(timeoutId);
			}
		}
	}, [state.isAuthenticated, state.sessionExpiresAt]);

	return {
		...state,
		checkSession,
		logout,
		clearError,
	};
};
