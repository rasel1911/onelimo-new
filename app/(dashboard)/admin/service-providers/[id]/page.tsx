import { format } from "date-fns";
import { ArrowLeft, Pencil } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { DeleteServiceProviderButton } from "@/app/(dashboard)/admin/components/delete-service-provider-button";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

import { ServiceProviderDetailsSkeleton } from "../../components/service-provider-details-skeleton";
import { ServiceProviderError } from "../../components/service-provider-error";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

const ServiceProviderDetailsSection = async ({ id }: { id: string }) => {
	try {
		const response = await fetch(`${BASE_URL}/api/service-providers/${id}`, {
			cache: "no-store",
		});

		if (response.status === 404) {
			notFound();
		}

		if (!response.ok) {
			throw new Error("Failed to fetch service provider");
		}

		const serviceProvider = await response.json();

		return (
			<div className="flex flex-col gap-6">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-4">
						<Button asChild variant="outline" size="icon">
							<Link href="/admin/service-providers">
								<ArrowLeft className="size-4" />
								<span className="sr-only">Back to service providers</span>
							</Link>
						</Button>
						<div>
							<h1 className="text-3xl font-bold tracking-tight">{serviceProvider.name}</h1>
							<p className="text-muted-foreground">Service provider details</p>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<Button asChild variant="outline">
							<Link href={`/admin/service-providers/${id}/edit`}>
								<Pencil className="mr-2 size-4" />
								Edit
							</Link>
						</Button>
						<DeleteServiceProviderButton id={id} />
					</div>
				</div>

				<div className="grid gap-6 md:grid-cols-2">
					<Card>
						<CardHeader>
							<CardTitle>Provider Information</CardTitle>
							<CardDescription>Basic details about this service provider</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid grid-cols-2 gap-4">
								<div>
									<p className="text-sm font-medium text-muted-foreground">Name</p>
									<p className="font-medium">{serviceProvider.name}</p>
								</div>
								<div>
									<p className="text-sm font-medium text-muted-foreground">Status</p>
									<div
										className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
											serviceProvider.status === "active"
												? "border border-green-200 bg-green-100 text-green-800"
												: "border border-gray-200 bg-gray-100 text-gray-800"
										}`}
									>
										{serviceProvider.status.charAt(0).toUpperCase() +
											serviceProvider.status.slice(1)}
									</div>
								</div>
								<div>
									<p className="text-sm font-medium text-muted-foreground">Email</p>
									<p>{serviceProvider.email}</p>
								</div>
								<div>
									<p className="text-sm font-medium text-muted-foreground">Phone</p>
									<p>{serviceProvider.phone}</p>
								</div>
								<div>
									<p className="text-sm font-medium text-muted-foreground">Area Covered</p>
									<p>{serviceProvider.areaCovered?.join(", ") || "N/A"}</p>
								</div>
								<div>
									<p className="text-sm font-medium text-muted-foreground">Created</p>
									<p>{format(new Date(serviceProvider.createdAt), "PPP")}</p>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Location</CardTitle>
							<CardDescription>Associated location information</CardDescription>
						</CardHeader>
						<CardContent>
							{serviceProvider.locationId ? (
								<div>
									<p className="text-sm font-medium text-muted-foreground">Location ID</p>
									<p>{serviceProvider.locationId}</p>
								</div>
							) : (
								<p className="text-muted-foreground">No location associated with this provider</p>
							)}
						</CardContent>
						<CardFooter>
							<Button variant="outline" size="sm" asChild>
								<Link
									href={`/admin/locations${serviceProvider.locationId ? `/${serviceProvider.locationId}` : ""}`}
								>
									{serviceProvider.locationId ? "View Location" : "Assign Location"}
								</Link>
							</Button>
						</CardFooter>
					</Card>
				</div>
			</div>
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
