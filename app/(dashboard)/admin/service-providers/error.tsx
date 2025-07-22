"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const ServiceProvidersError = ({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) => {
	useEffect(() => {
		console.error(error);
	}, [error]);

	return (
		<div className="space-y-6">
			<div className="mb-6">
				<h1 className="text-3xl font-bold tracking-tight">Service Providers</h1>
				<p className="text-muted-foreground">
					Manage and view all service providers in the system.
				</p>
			</div>

			<div className="flex min-h-[60vh] items-center justify-center">
				<Card className="w-full max-w-md">
					<CardHeader className="text-center">
						<div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
							<AlertCircle className="size-6 text-red-600 dark:text-red-400" />
						</div>
						<CardTitle className="text-xl">Something went wrong!</CardTitle>
						<CardDescription>
							There was an error loading the service providers. Please try again or contact support
							if the issue persists.
						</CardDescription>
					</CardHeader>
					<CardContent className="text-center">
						<Button onClick={() => reset()} className="w-full">
							<RefreshCw className="mr-2 size-4" />
							Try again
						</Button>
					</CardContent>
				</Card>
			</div>
		</div>
	);
};

export default ServiceProvidersError;
