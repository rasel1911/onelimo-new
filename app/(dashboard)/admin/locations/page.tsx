"use client";

import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";

import { LocationError } from "@/app/(dashboard)/admin/components/location-error";
import LocationsTable from "@/app/(dashboard)/admin/components/locations-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import LocationsLoading from "./loading";

export type Location = {
	id: string;
	city: string;
	zipcodes: string[];
	createdAt: string;
	updatedAt: string;
};

const LocationsSection = () => {
	const [locations, setLocations] = useState<Location[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [showStaticFirst, setShowStaticFirst] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchLocations = async () => {
		try {
			setIsLoading(true);
			setError(null);

			const [response] = await Promise.all([
				fetch("/api/locations"),
				new Promise((resolve) => setTimeout(resolve, 800)),
			]);

			if (!response.ok) {
				throw new Error("Failed to fetch locations");
			}

			const data: Location[] = await response.json();
			setLocations(data);
		} catch (error) {
			console.error("Error loading locations:", error);
			setError("Failed to load location data. Please try refreshing the page.");
		} finally {
			setTimeout(() => {
				setIsLoading(false);
				setShowStaticFirst(false);
			}, 100);
		}
	};

	useEffect(() => {
		fetchLocations();

		const handleFocus = () => {
			fetchLocations();
		};

		window.addEventListener("focus", handleFocus);

		return () => {
			window.removeEventListener("focus", handleFocus);
		};
	}, []);

	if (showStaticFirst) {
		return <LocationsLoading />;
	}

	if (error) {
		return (
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.4 }}
				className="flex flex-col gap-6"
			>
				<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
					<div>
						<h1 className="text-3xl font-bold tracking-tight">Locations</h1>
						<p className="text-muted-foreground">Manage and view all service locations.</p>
					</div>
					<Button asChild>
						<Link href="/admin/locations/new">
							<Plus className="mr-2 size-4" />
							Add Location
						</Link>
					</Button>
				</div>

				{/* Error Card */}
				<Card>
					<CardContent className="pt-6">
						<LocationError
							title="Error Loading Locations"
							message={error}
							onRetry={fetchLocations}
						/>
					</CardContent>
				</Card>
			</motion.div>
		);
	}

	return (
		<Suspense fallback={<LocationsLoading />}>
			<div className="flex flex-col gap-6">
				{/* Header - Static, no animation */}
				<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
					<div>
						<h1 className="text-3xl font-bold tracking-tight">Locations</h1>
						<p className="text-muted-foreground">Manage and view all service locations.</p>
					</div>
					<div>
						<Button asChild>
							<Link href="/admin/locations/new">
								<Plus className="mr-2 size-4" />
								Add Location
							</Link>
						</Button>
					</div>
				</div>

				{/* Locations Table - Animated dynamic content */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.4 }}
				>
					<Card>
						<CardHeader>
							<CardTitle>All Locations</CardTitle>
							<CardDescription>
								A list of all service locations with their associated postcodes.
							</CardDescription>
						</CardHeader>
						<CardContent>
							<LocationsTable data={locations} isLoading={isLoading} />
						</CardContent>
					</Card>
				</motion.div>
			</div>
		</Suspense>
	);
};

const LocationsPage = () => {
	return <LocationsSection />;
};

export default LocationsPage;
