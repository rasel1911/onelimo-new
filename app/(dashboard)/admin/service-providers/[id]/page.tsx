import { notFound } from "next/navigation";
import { Suspense } from "react";

import { getAllLocations } from "@/db/queries/location.queries";

import { ServiceProviderDetailsClient } from "./service-provider-details-client";
import { ServiceProviderDetailsSkeleton } from "../../components/service-provider-details-skeleton";
import { ServiceProviderError } from "../../components/service-provider-error";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

const ServiceProviderDetailsSection = async ({ id }: { id: string }) => {
	try {
		const response = await fetch(`${BASE_URL}/api/service-providers/${id}`);

		if (response.status === 404) {
			notFound();
		}

		if (!response.ok) {
			throw new Error("Failed to fetch service provider");
		}

		const serviceProvider = await response.json();

		const allLocations = await getAllLocations();
		const providerLocations = allLocations.filter((location) =>
			serviceProvider.locationIds?.includes(location.id),
		);

		return (
			<ServiceProviderDetailsClient
				serviceProvider={serviceProvider}
				locations={providerLocations}
			/>
		);
	} catch (error) {
		console.error("Error loading service provider:", error);
		return (
			<ServiceProviderError
				title="Error Loading Service Provider"
				message="Failed to load service provider details. Please try refreshing the page."
			/>
		);
	}
};

const ServiceProviderDetailsPage = ({ params }: { params: { id: string } }) => {
	return (
		<Suspense fallback={<ServiceProviderDetailsSkeleton />}>
			<ServiceProviderDetailsSection id={params.id} />
		</Suspense>
	);
};

export default ServiceProviderDetailsPage;
