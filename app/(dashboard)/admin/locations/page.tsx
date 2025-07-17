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

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

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
	const [error, setError] = useState<string | null>(null);

	const fetchLocations = async () => {
		try {
			setIsLoading(true);
			setError(null);

			const response = await fetch(`${BASE_URL}/api/locations`);

			if (!response.ok) {
				throw new Error("Failed to fetch locations");
			}

			const data: Location[] = await response.json();
			setLocations(data);
		} catch (error) {
			console.error("Error loading locations:", error);
			setError("Failed to load location data. Please try refreshing the page.");
		} finally {
			setIsLoading(false);
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
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
			className="flex flex-col gap-6"
		>
			{/* Header */}
			<motion.div
				initial={{ opacity: 0, x: -20 }}
				animate={{ opacity: 1, x: 0 }}
				transition={{ duration: 0.4, delay: 0.1 }}
				className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
			>
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Locations</h1>
					<p className="text-muted-foreground">Manage and view all service locations.</p>
				</div>
				<motion.div
					initial={{ opacity: 0, x: 20 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ duration: 0.4, delay: 0.2 }}
				>
					<Button asChild>
						<Link href="/admin/locations/new">
							<Plus className="mr-2 size-4" />
							Add Location
						</Link>
					</Button>
				</motion.div>
			</motion.div>

			{/* Locations Table */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5, delay: 0.3 }}
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
		</motion.div>
	);
};

const LocationsPage = () => {
	return (
		<Suspense fallback={<LocationsLoading />}>
			<LocationsSection />
		</Suspense>
	);
};

export default LocationsPage;
