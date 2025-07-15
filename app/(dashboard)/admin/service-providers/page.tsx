"use client";

import { motion } from "framer-motion";
import { Mail, Plus, Users } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { InviteModal } from "@/app/(dashboard)/admin/components/invite-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { ServiceProviderError } from "../components/service-provider-error";
import { ServiceProviderTable, type ServiceProvider } from "../components/service-provider-table";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

const ServiceProvidersSection = () => {
	const [serviceProviders, setServiceProviders] = useState<ServiceProvider[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchServiceProviders = async () => {
		try {
			setIsLoading(true);
			setError(null);

			const response = await fetch(`${BASE_URL}/api/service-providers`, {
				cache: "no-store",
			});

			if (!response.ok) {
				throw new Error("Failed to fetch service providers");
			}

			const data: ServiceProvider[] = await response.json();
			setServiceProviders(data);
		} catch (error) {
			console.error("Error loading service providers:", error);
			setError("Failed to load service provider data. Please try refreshing the page.");
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchServiceProviders();
	}, []);

	if (error) {
		return (
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.4 }}
				className="space-y-6"
			>
				{/* Header - keep it visible even on error */}
				<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
					<div>
						<h1 className="text-3xl font-bold tracking-tight">Service Providers</h1>
						<p className="text-muted-foreground">
							Manage and view all service providers in the system.
						</p>
					</div>
					<div className="flex flex-col gap-2 sm:flex-row">
						<Button variant="ghost" asChild>
							<Link href="/admin/service-providers/invites">
								<Users className="mr-2 size-4" />
								View Invites
							</Link>
						</Button>
						<InviteModal
							trigger={
								<Button variant="outline">
									<Mail className="mr-2 size-4" />
									Invite Partner
								</Button>
							}
						/>
						<Button asChild>
							<Link href="/admin/service-providers/new">
								<Plus className="mr-2 size-4" />
								Add Provider
							</Link>
						</Button>
					</div>
				</div>

				{/* Error Card */}
				<Card>
					<CardContent className="pt-6">
						<ServiceProviderError
							title="Error Loading Service Providers"
							message={error}
							onRetry={fetchServiceProviders}
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
			className="space-y-6"
		>
			{/* Header */}
			<motion.div
				initial={{ opacity: 0, x: -20 }}
				animate={{ opacity: 1, x: 0 }}
				transition={{ duration: 0.4, delay: 0.1 }}
				className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
			>
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Service Providers</h1>
					<p className="text-muted-foreground">
						Manage and view all service providers in the system.
					</p>
				</div>
				<motion.div
					initial={{ opacity: 0, x: 20 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ duration: 0.4, delay: 0.2 }}
					className="flex flex-col gap-2 sm:flex-row"
				>
					<Button variant="ghost" asChild>
						<Link href="/admin/service-providers/invites">
							<Users className="mr-2 size-4" />
							View Invites
						</Link>
					</Button>
					<InviteModal
						trigger={
							<Button variant="outline">
								<Mail className="mr-2 size-4" />
								Invite Partner
							</Button>
						}
					/>
					<Button asChild>
						<Link href="/admin/service-providers/new">
							<Plus className="mr-2 size-4" />
							Add Provider
						</Link>
					</Button>
				</motion.div>
			</motion.div>

			{/* Service Providers Table */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5, delay: 0.3 }}
			>
				<Card>
					<CardHeader>
						<CardTitle>All Service Providers</CardTitle>
						<CardDescription>A list of all service providers with their details.</CardDescription>
					</CardHeader>
					<CardContent>
						{isLoading ? (
							<div className="flex items-center justify-center py-8">
								<div className="text-sm text-muted-foreground">Loading...</div>
							</div>
						) : (
							<ServiceProviderTable data={serviceProviders} />
						)}
					</CardContent>
				</Card>
			</motion.div>
		</motion.div>
	);
};

const ServiceProvidersPage = () => {
	return <ServiceProvidersSection />;
};

export default ServiceProvidersPage;
