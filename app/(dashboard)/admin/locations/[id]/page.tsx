"use client";

import { motion } from "framer-motion";
import { MapPin, Pencil } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useEffect, useState } from "react";

import { LocationDetailsSkeleton } from "@/app/(dashboard)/admin/components/location-details-skeleton";
import { LocationError } from "@/app/(dashboard)/admin/components/location-error";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

interface LocationPageProps {
	params: {
		id: string;
	};
}

type Location = {
	id: string;
	city: string;
	zipcodes: string[];
	createdAt: string;
	updatedAt: string;
};

const LocationPage = ({ params }: LocationPageProps) => {
	const [location, setLocation] = useState<Location | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchLocation = async () => {
			try {
				setIsLoading(true);
				setError(null);

				const response = await fetch(`/api/locations/${params.id}`);

				if (response.status === 404) {
					notFound();
				}

				if (!response.ok) {
					throw new Error("Failed to fetch location");
				}

				const data: Location = await response.json();
				setLocation(data);
			} catch (error) {
				console.error("Error loading location:", error);
				setError("Failed to load location details. Please try refreshing the page.");
			} finally {
				setIsLoading(false);
			}
		};

		fetchLocation();
	}, [params.id]);

	if (isLoading) {
		return <LocationDetailsSkeleton />;
	}

	if (error) {
		return (
			<div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center">
				<Card className="w-full max-w-xl">
					<CardContent className="pt-6">
						<LocationError
							title="Error Loading Location"
							message={error}
							onRetry={() => window.location.reload()}
						/>
					</CardContent>
				</Card>
			</div>
		);
	}

	if (!location) {
		return null;
	}

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
			className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center"
		>
			<Card className="w-full max-w-xl">
				<CardHeader>
					<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
						<motion.div
							initial={{ opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.4, delay: 0.1 }}
						>
							<CardTitle className="flex items-center gap-2">
								<MapPin className="size-5 text-primary" />
								{location.city}
							</CardTitle>
							<CardDescription>Location details and associated postcodes</CardDescription>
						</motion.div>
						<motion.div
							initial={{ opacity: 0, x: 20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.4, delay: 0.2 }}
						>
							<Link href={`/admin/locations/${location.id}/edit`} passHref>
								<Button size="sm">
									<Pencil className="mr-2 size-4" />
									Edit
								</Button>
							</Link>
						</motion.div>
					</div>
				</CardHeader>
				<CardContent className="space-y-6">
					<motion.div
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.3, delay: 0.3 }}
					>
						<h3 className="mb-1 text-sm font-medium text-muted-foreground">City</h3>
						<p className="text-lg font-medium">{location.city}</p>
					</motion.div>

					<motion.div
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.3, delay: 0.4 }}
					>
						<h3 className="mb-1 text-sm font-medium text-muted-foreground">Postcodes</h3>
						<div className="rounded-md bg-muted p-3">
							{location.zipcodes.length > 0 ? (
								<div className="flex flex-wrap gap-2">
									{location.zipcodes.map((zipcode, index) => (
										<motion.span
											key={zipcode}
											initial={{ opacity: 0, scale: 0.8 }}
											animate={{ opacity: 1, scale: 1 }}
											transition={{ duration: 0.2, delay: 0.5 + index * 0.05 }}
											className="inline-flex items-center rounded-md border bg-background px-2.5 py-0.5 text-sm"
										>
											{zipcode}
										</motion.span>
									))}
								</div>
							) : (
								<p className="text-muted-foreground">No postcodes available</p>
							)}
						</div>
					</motion.div>
				</CardContent>
				<CardFooter className="flex justify-between border-t pt-6">
					<motion.div
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.3, delay: 0.8 }}
					>
						<Link href="/admin/locations" passHref>
							<Button variant="outline">Back to Locations</Button>
						</Link>
					</motion.div>
				</CardFooter>
			</Card>
		</motion.div>
	);
};

export default LocationPage;
