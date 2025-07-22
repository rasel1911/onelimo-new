"use client";

import { format } from "date-fns";
import {
	ArrowLeft,
	Pencil,
	Mail,
	Phone,
	MapPin,
	Calendar,
	Clock,
	Star,
	Zap,
	Shield,
	Car,
	Users,
	Activity,
	Building2,
	Badge,
} from "lucide-react";
import Link from "next/link";

import { DeleteServiceProviderButton } from "@/app/(dashboard)/admin/components/delete-service-provider-button";
import { Badge as UIBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface ServiceProviderDetailsClientProps {
	serviceProvider: any;
	locations: any[];
}

export const ServiceProviderDetailsClient = ({
	serviceProvider,
	locations,
}: ServiceProviderDetailsClientProps) => {
	const getStatusColor = (status: string) => {
		switch (status) {
			case "active":
				return "bg-green-100 text-green-800 border-green-200";
			case "pending":
				return "bg-yellow-100 text-yellow-800 border-yellow-200";
			case "inactive":
				return "bg-gray-100 text-gray-800 border-gray-200";
			default:
				return "bg-gray-100 text-gray-800 border-gray-200";
		}
	};

	const getRatingStars = (rating: number) => {
		return Array.from({ length: 5 }, (_, i) => (
			<Star
				key={i}
				className={`size-4 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
			/>
		));
	};

	const formatServiceTypes = (types: string[]) => {
		return types.map((type) =>
			type
				.split("_")
				.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
				.join(" "),
		);
	};

	return (
		<div className="space-y-6">
			{/* Header Section */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-4">
					<Button asChild variant="outline" size="icon">
						<Link href="/admin/service-providers">
							<ArrowLeft className="size-4" />
							<span className="sr-only">Back to service providers</span>
						</Link>
					</Button>
					<div>
						<h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
							<Building2 className="size-8 text-primary" />
							{serviceProvider.name}
						</h1>
						<p className="text-muted-foreground">Service provider details and metrics</p>
					</div>
				</div>
				<div className="flex items-center gap-2">
					<Button asChild variant="outline">
						<Link href={`/admin/service-providers/${serviceProvider.id}/edit`}>
							<Pencil className="mr-2 size-4" />
							Edit Provider
						</Link>
					</Button>
					<DeleteServiceProviderButton id={serviceProvider.id} />
				</div>
			</div>

			{/* Status Banner */}
			<Card className="border-l-4 border-l-primary">
				<CardContent className="pt-6">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-4">
							<div
								className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-semibold ${getStatusColor(
									serviceProvider.status,
								)}`}
							>
								<Shield className="mr-2 size-4" />
								{serviceProvider.status.charAt(0).toUpperCase() + serviceProvider.status.slice(1)}
							</div>
							<div className="flex items-center gap-2 text-sm text-muted-foreground">
								<Calendar className="size-4" />
								Joined {format(new Date(serviceProvider.createdAt), "MMMM yyyy")}
							</div>
						</div>
						<div className="flex items-center gap-2">
							{serviceProvider.role && (
								<UIBadge variant="secondary" className="capitalize">
									<Badge className="mr-1 size-3" />
									{serviceProvider.role}
								</UIBadge>
							)}
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Main Content Grid */}
			<div className="grid gap-6 lg:grid-cols-3">
				{/* Left Column - Contact & Basic Info */}
				<div className="space-y-6">
					{/* Contact Information */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Mail className="size-5 text-primary" />
								Contact Information
							</CardTitle>
							<CardDescription>Primary contact details for this service provider</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
								<div>
									<p className="text-sm font-medium text-muted-foreground">Email</p>
									<p className="font-medium">{serviceProvider.email}</p>
								</div>
							</div>
							<div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
								<div>
									<p className="text-sm font-medium text-muted-foreground">Phone</p>
									<p className="font-medium">{serviceProvider.phone}</p>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Performance Metrics */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Activity className="size-5 text-primary" />
								Performance Metrics
							</CardTitle>
							<CardDescription>Service quality and reliability indicators</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="space-y-3">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-2">
										<Star className="size-4 text-yellow-500" />
										<span className="text-sm font-medium">Reputation</span>
									</div>
									<div className="flex items-center gap-2">
										<div className="flex">{getRatingStars(serviceProvider.reputation || 0)}</div>
										<span className="text-sm text-muted-foreground">
											({serviceProvider.reputation || 0}/5)
										</span>
									</div>
								</div>
								<Separator />
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-2">
										<Zap className="size-4 text-blue-500" />
										<span className="text-sm font-medium">Response Time</span>
									</div>
									<div className="flex items-center gap-2">
										<div className="flex">{getRatingStars(serviceProvider.responseTime || 0)}</div>
										<span className="text-sm text-muted-foreground">
											({serviceProvider.responseTime || 0}/5)
										</span>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Middle Column - Service Details */}
				<div className="space-y-6">
					{/* Service Types */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Car className="size-5 text-primary" />
								Service Types
							</CardTitle>
							<CardDescription>Vehicle types and services offered</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="flex flex-wrap gap-2">
								{serviceProvider.serviceType && serviceProvider.serviceType.length > 0 ? (
									formatServiceTypes(serviceProvider.serviceType).map((type, index) => (
										<UIBadge key={index} variant="outline" className="text-sm">
											{type}
										</UIBadge>
									))
								) : (
									<p className="text-muted-foreground">No service types specified</p>
								)}
							</div>
						</CardContent>
					</Card>

					{/* Coverage Areas */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<MapPin className="size-5 text-primary" />
								Coverage Areas
							</CardTitle>
							<CardDescription>Specific areas and regions covered</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-3">
								{serviceProvider.areaCovered && serviceProvider.areaCovered.length > 0 ? (
									<div className="flex flex-wrap gap-2">
										{serviceProvider.areaCovered.map((area: string, index: number) => (
											<UIBadge key={index} variant="secondary" className="text-sm">
												{area}
											</UIBadge>
										))}
									</div>
								) : (
									<p className="text-muted-foreground">All areas in service locations</p>
								)}
							</div>
						</CardContent>
					</Card>

					{/* Account Information */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Clock className="size-5 text-primary" />
								Account Information
							</CardTitle>
							<CardDescription>Registration and activity timestamps</CardDescription>
						</CardHeader>
						<CardContent className="space-y-3">
							<div className="flex items-center justify-between py-2">
								<span className="text-sm text-muted-foreground">Created</span>
								<span className="text-sm font-medium">
									{format(new Date(serviceProvider.createdAt), "PPP 'at' p")}
								</span>
							</div>
							<Separator />
							<div className="flex items-center justify-between py-2">
								<span className="text-sm text-muted-foreground">Last Updated</span>
								<span className="text-sm font-medium">
									{format(new Date(serviceProvider.updatedAt), "PPP 'at' p")}
								</span>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Right Column - Locations */}
				<div className="space-y-6">
					{/* Service Locations */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<MapPin className="size-5 text-primary" />
								Service Locations
							</CardTitle>
							<CardDescription>Cities and regions where services are provided</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-3">
								{locations.length > 0 ? (
									locations.map((location) => (
										<div key={location.id} className="rounded-lg border bg-card p-3">
											<div className="flex items-center justify-between">
												<div>
													<h4 className="font-medium">{location.city}</h4>
													{location.zipcodes && location.zipcodes.length > 0 && (
														<p className="mt-1 text-sm text-muted-foreground">
															{location.zipcodes.length === 1 && location.zipcodes[0] === "all"
																? "All postcodes"
																: `${location.zipcodes.length} postcode${
																		location.zipcodes.length > 1 ? "s" : ""
																	}`}
														</p>
													)}
												</div>
												<Button variant="ghost" size="sm" asChild>
													<Link href={`/admin/locations/${location.id}`}>
														<MapPin className="size-4" />
													</Link>
												</Button>
											</div>
											{location.zipcodes &&
												location.zipcodes.length > 0 &&
												location.zipcodes[0] !== "all" && (
													<div className="mt-2 flex flex-wrap gap-1">
														{location.zipcodes.slice(0, 3).map((zipcode: string, index: number) => (
															<span key={index} className="rounded bg-muted px-2 py-1 text-xs">
																{zipcode}
															</span>
														))}
														{location.zipcodes.length > 3 && (
															<span className="px-2 py-1 text-xs text-muted-foreground">
																+{location.zipcodes.length - 3} more
															</span>
														)}
													</div>
												)}
										</div>
									))
								) : (
									<div className="py-6 text-center text-muted-foreground">
										<MapPin className="mx-auto mb-2 size-8 opacity-50" />
										<p>No locations assigned</p>
										<Button variant="outline" size="sm" className="mt-2" asChild>
											<Link href={`/admin/service-providers/${serviceProvider.id}/edit`}>
												Assign Locations
											</Link>
										</Button>
									</div>
								)}
							</div>
						</CardContent>
					</Card>

					{/* Quick Stats */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Users className="size-5 text-primary" />
								Quick Stats
							</CardTitle>
							<CardDescription>Overview of key metrics</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-2 gap-4">
								<div className="rounded-lg bg-muted/50 p-3 text-center">
									<div className="text-2xl font-bold text-primary">
										{serviceProvider.serviceType?.length || 0}
									</div>
									<div className="text-sm text-muted-foreground">Service Types</div>
								</div>
								<div className="rounded-lg bg-muted/50 p-3 text-center">
									<div className="text-2xl font-bold text-primary">{locations.length}</div>
									<div className="text-sm text-muted-foreground">Locations</div>
								</div>
								<div className="rounded-lg bg-muted/50 p-3 text-center">
									<div className="text-2xl font-bold text-primary">
										{serviceProvider.areaCovered?.length || 0}
									</div>
									<div className="text-sm text-muted-foreground">Coverage Areas</div>
								</div>
								<div className="rounded-lg bg-muted/50 p-3 text-center">
									<div className="text-2xl font-bold text-primary">
										{Math.round(
											(((serviceProvider.reputation || 0) + (serviceProvider.responseTime || 0)) /
												2) *
												10,
										) / 10}
									</div>
									<div className="text-sm text-muted-foreground">Overall Score</div>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
};
