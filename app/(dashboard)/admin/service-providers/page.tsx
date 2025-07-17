"use client";

import { motion } from "framer-motion";
import { Mail, Plus, Users } from "lucide-react";
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";

import { InviteModal } from "@/app/(dashboard)/admin/components/invite-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import ServiceProvidersLoading from "./loading";
import { ServiceProviderError } from "../components/service-provider-error";
import { ServiceProviderTable, type ServiceProvider } from "../components/service-provider-table";

const ServiceProvidersSection = () => {
	const [serviceProviders, setServiceProviders] = useState<ServiceProvider[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [showStaticFirst, setShowStaticFirst] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchServiceProviders = async (bypassCache = false) => {
		try {
			setIsLoading(true);
			setError(null);

			const url = bypassCache
				? `/api/service-providers?_t=${Date.now()}`
				: "/api/service-providers";

			const [response] = await Promise.all([
				fetch(url, bypassCache ? { cache: "no-store" } : {}),
				new Promise((resolve) => setTimeout(resolve, 800)),
			]);

			if (!response.ok) {
				throw new Error("Failed to fetch service providers");
			}

			const data: ServiceProvider[] = await response.json();
			setServiceProviders(data);
		} catch (error) {
			console.error("Error loading service providers:", error);
			setError("Failed to load service provider data. Please try refreshing the page.");
		} finally {
			setTimeout(() => {
				setIsLoading(false);
				setShowStaticFirst(false);
			}, 100);
		}
	};

	useEffect(() => {
		const urlParams = new URLSearchParams(window.location.search);
		const forceRefresh =
			urlParams.has("refresh") ||
			document.referrer.includes("/edit") ||
			document.referrer.includes("/new");

		fetchServiceProviders(forceRefresh);

		const handleFocus = () => {
			fetchServiceProviders(true);
		};

		window.addEventListener("focus", handleFocus);

		return () => {
			window.removeEventListener("focus", handleFocus);
		};
	}, []);

	if (showStaticFirst) {
		return <ServiceProvidersLoading />;
	}

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
							onRetry={() => fetchServiceProviders(true)}
						/>
					</CardContent>
				</Card>
			</motion.div>
		);
	}

	return (
		<Suspense fallback={<ServiceProvidersLoading />}>
			<div className="space-y-6">
				{/* Header - Static, no animation */}
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

				{/* Service Providers Table - Animated dynamic content */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.4 }}
				>
					<Card>
						<CardHeader>
							<CardTitle>All Service Providers</CardTitle>
							<CardDescription>A list of all service providers with their details.</CardDescription>
						</CardHeader>
						<CardContent>
							<ServiceProviderTable data={serviceProviders} />
						</CardContent>
					</Card>
				</motion.div>
			</div>
		</Suspense>
	);
};

const ServiceProvidersPage = () => {
	return <ServiceProvidersSection />;
};

export default ServiceProvidersPage;
