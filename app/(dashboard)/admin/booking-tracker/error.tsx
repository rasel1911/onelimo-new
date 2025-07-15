"use client";

import { AlertCircle } from "lucide-react";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function BookingsError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	useEffect(() => {
		console.error(error);
	}, [error]);

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<p className="text-sm text-muted-foreground">Error loading the booking data</p>
				<Tabs defaultValue="tracker" className="w-full">
					<TabsList>
						<TabsTrigger value="tracker" disabled>
							Booking Tracker
						</TabsTrigger>
						<TabsTrigger value="list" disabled>
							All Bookings
						</TabsTrigger>
					</TabsList>
				</Tabs>
			</div>

			<Card className="col-span-3">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<AlertCircle className="size-5 text-destructive" />
						Error Loading Booking Data
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col items-center justify-center py-10">
						<p className="mb-6 max-w-md text-center text-muted-foreground">
							There was an error loading the booking data. Please try again or contact support if
							the issue persists.
						</p>
						<Button onClick={() => reset()}>Try Again</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
