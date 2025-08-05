import { notFound } from "next/navigation";
import { Suspense } from "react";

import { ServiceProviderForm } from "@/app/(dashboard)/admin/components/service-provider-form";

import { ServiceProviderError } from "../../../components/service-provider-error";
import { ServiceProviderFormSkeleton } from "../../../components/service-provider-form-skeleton";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

const ServiceProviderEditSection = async ({ id }: { id: string }) => {
	try {
		const response = await fetch(`${BASE_URL}/api/service-providers/${id}`);

		if (response.status === 404) {
			notFound();
		}

		if (!response.ok) {
			throw new Error("Failed to fetch service provider");
		}

		const serviceProvider = await response.json();

		return (
			<ServiceProviderForm
				mode="edit"
				id={id}
				initialData={{
					name: serviceProvider.name,
					email: serviceProvider.email,
					phone: serviceProvider.phone,
					status: serviceProvider.status as "active" | "inactive" | "pending",
					role: serviceProvider.role || "partner",
					serviceLocations: serviceProvider.serviceLocations || [],
					areaCovered: serviceProvider.areaCovered || [],
					serviceType: serviceProvider.serviceType || ["stretch_limousine"],
					reputation: serviceProvider.reputation || 0,
					responseTime: serviceProvider.responseTime || 0,
				}}
			/>
		);
	} catch (error) {
		console.error("Error loading service provider for edit:", error);
		return (
			<ServiceProviderError
				title="Error Loading Service Provider"
				message="Failed to load service provider details for editing. Please try refreshing the page."
			/>
		);
	}
};

const EditServiceProviderPage = ({ params }: { params: { id: string } }) => {
	return (
		<Suspense fallback={<ServiceProviderFormSkeleton />}>
			<ServiceProviderEditSection id={params.id} />
		</Suspense>
	);
};

export default EditServiceProviderPage;
