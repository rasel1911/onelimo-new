"use client";

import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const LocationsLoading = () => {
	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Locations</h1>
					<p className="text-muted-foreground">Manage and view all service locations.</p>
				</div>
				<Button disabled>
					<Plus className="mr-2 size-4" />
					Add Location
				</Button>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>All Locations</CardTitle>
					<CardDescription>
						A list of all service locations with their associated postcodes.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						{/* Search bar skeleton */}
						<div className="flex items-center gap-2">
							<Skeleton className="h-10 w-64" />
						</div>

						{/* Table skeleton */}
						<div className="rounded-md border">
							<div className="p-4">
								{/* Table header */}
								<div className="grid grid-cols-4 gap-4 border-b pb-4">
									<Skeleton className="h-4 w-16" />
									<Skeleton className="h-4 w-20" />
									<Skeleton className="h-4 w-16" />
									<Skeleton className="h-4 w-16" />
								</div>

								{/* Table rows */}
								<div className="space-y-3 pt-4">
									{Array.from({ length: 5 }).map((_, i) => (
										<div key={i} className="grid grid-cols-4 items-center gap-4">
											<Skeleton className="h-4 w-24" />
											<Skeleton className="h-4 w-32" />
											<Skeleton className="h-4 w-20" />
											<Skeleton className="size-8 rounded" />
										</div>
									))}
								</div>
							</div>
						</div>

						{/* Pagination skeleton */}
						<div className="flex items-center justify-between py-4">
							<Skeleton className="h-4 w-32" />
							<div className="flex items-center space-x-2">
								<Skeleton className="h-8 w-20" />
								<Skeleton className="h-8 w-16" />
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
};

export default LocationsLoading;
