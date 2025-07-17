"use client";

import { notFound } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { LocationError } from "@/app/(dashboard)/admin/components/location-error";
import { LocationForm } from "@/app/(dashboard)/admin/components/location-form";
import LocationFormSkeleton from "@/app/(dashboard)/admin/components/location-form-skeleton";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

interface EditLocationPageProps {
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

// Async component for location edit form
const LocationEditSection = ({ id }: { id: string }) => {
	const [location, setLocation] = useState<Location | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchLocation = async () => {
			try {
				setIsLoading(true);
				setError(null);

				const response = await fetch(`${BASE_URL}/api/locations/${id}`);

				if (response.status === 404) {
					notFound();
				}

				if (!response.ok) {
					throw new Error("Failed to fetch location");
				}

				const data: Location = await response.json();
				setLocation(data);
			} catch (error) {
				console.error("Error loading location for edit:", error);
				setError("Failed to load location details for editing. Please try refreshing the page.");
			} finally {
				setIsLoading(false);
			}
		};

		fetchLocation();
	}, [id]);

	if (isLoading) {
		return <LocationFormSkeleton />;
	}

	if (error) {
		return (
			<div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center">
				<LocationError
					title="Error Loading Location"
					message={error}
					onRetry={() => window.location.reload()}
				/>
			</div>
		);
	}

	if (!location) {
		return null;
	}

	return (
		<div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center">
			<LocationForm initialData={location} mode="edit" />
		</div>
	);
};

export default function EditLocationPage({ params }: EditLocationPageProps) {
	return (
		<Suspense fallback={<LocationFormSkeleton />}>
			<LocationEditSection id={params.id} />
		</Suspense>
	);
}
