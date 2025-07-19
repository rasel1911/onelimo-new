"use client";

import { AlertTriangle, ArrowLeft, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ErrorProps {
	error: Error & { digest?: string };
	reset: () => void;
}

export const PersistentLinksError = ({ error, reset }: ErrorProps) => {
	useEffect(() => {
		console.error("Persistent links page error:", error);
	}, [error]);

	return (
		<div className="container py-8">
			<div className="mb-6">
				<Link href="/admin/service-providers" passHref>
					<Button variant="outline" size="sm" className="mb-4">
						<ArrowLeft className="mr-2 size-4" />
						Back to Service Providers
					</Button>
				</Link>
				<div className="flex flex-col md:flex-row md:items-center md:justify-between">
					<div>
						<h1 className="text-3xl font-bold tracking-tight">Persistent Registration Links</h1>
						<p className="text-muted-foreground">
							Manage permanent links for service provider registration that never expire
						</p>
					</div>
				</div>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Error Loading Persistent Links</CardTitle>
					<CardDescription>
						Something went wrong while loading the persistent registration links.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Alert variant="destructive">
						<AlertTriangle className="size-4" />
						<AlertTitle>Error</AlertTitle>
						<AlertDescription>
							{error.message || "An unexpected error occurred while loading the persistent links."}
						</AlertDescription>
					</Alert>
					<div className="mt-6 flex gap-4">
						<Button onClick={reset}>
							<RefreshCw className="mr-2 size-4" />
							Try Again
						</Button>
						<Button variant="outline" asChild>
							<Link href="/admin/service-providers">Go Back to Service Providers</Link>
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
};

export default PersistentLinksError;
