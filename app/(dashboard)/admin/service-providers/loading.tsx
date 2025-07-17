"use client";

import { motion } from "framer-motion";
import { Mail, Plus, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const ServiceProvidersLoading = () => {
	return (
		<div className="space-y-6">
			<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Service Providers</h1>
					<p className="text-muted-foreground">
						Manage and view all service providers in the system.
					</p>
				</div>
				<div className="flex flex-col gap-2 sm:flex-row">
					<Button variant="ghost" disabled>
						<Users className="mr-2 size-4" />
						View Invites
					</Button>
					<Button variant="outline" disabled>
						<Mail className="mr-2 size-4" />
						Invite Partner
					</Button>
					<Button disabled>
						<Plus className="mr-2 size-4" />
						Add Provider
					</Button>
				</div>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>All Service Providers</CardTitle>
					<CardDescription>A list of all service providers with their details.</CardDescription>
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
								<div className="grid grid-cols-7 gap-4 border-b pb-4">
									<Skeleton className="h-4 w-16" />
									<Skeleton className="h-4 w-20" />
									<Skeleton className="h-4 w-16" />
									<Skeleton className="h-4 w-20" />
									<Skeleton className="h-4 w-16" />
									<Skeleton className="h-4 w-16" />
									<Skeleton className="h-4 w-16" />
								</div>

								{/* Table rows */}
								<div className="space-y-3 pt-4">
									{Array.from({ length: 5 }).map((_, i) => (
										<div key={i} className="grid grid-cols-7 items-center gap-4">
											<Skeleton className="h-4 w-24" />
											<Skeleton className="h-4 w-32" />
											<Skeleton className="h-4 w-20" />
											<Skeleton className="h-4 w-16" />
											<Skeleton className="h-6 w-16 rounded-full" />
											<Skeleton className="h-4 w-8" />
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

export default ServiceProvidersLoading;
