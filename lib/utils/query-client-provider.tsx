"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

const DEFAULT_STALE_TIME = 60 * 1000; // 1 minute
const DEFAULT_GC_TIME = 5 * 60 * 1000; // 5 minutes

/**
 * QueryProvider component that provides a QueryClient to the application
 * @param children - The children components to be wrapped by the QueryClientProvider
 * @returns A QueryClientProvider component that provides a QueryClient to the application
 */
export const QueryProvider = ({ children }: { children: React.ReactNode }) => {
	const [queryClient] = useState(
		() =>
			new QueryClient({
				defaultOptions: {
					queries: {
						staleTime: DEFAULT_STALE_TIME,
						gcTime: DEFAULT_GC_TIME,
					},
				},
			}),
	);

	return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};
