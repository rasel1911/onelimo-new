"use client";

import { motion } from "framer-motion";
import { Mail, Plus, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const ServiceProvidersLoading = () => {
	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.3 }}
			className="space-y-6"
		>
			<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
				<motion.div
					initial={{ opacity: 0, x: -20 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ duration: 0.4, delay: 0.1 }}
				>
					<div className="mb-2 h-9 w-48 animate-pulse rounded-md bg-muted" />
					<div className="h-5 w-64 animate-pulse rounded-md bg-muted" />
				</motion.div>
				<motion.div
					initial={{ opacity: 0, x: 20 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ duration: 0.4, delay: 0.2 }}
					className="flex flex-col gap-2 sm:flex-row"
				>
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
				</motion.div>
			</div>

			{/* Table Card Skeleton */}
			<Card>
				<CardHeader>
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ duration: 0.3, delay: 0.3 }}
						className="space-y-2"
					>
						<div className="h-6 w-48 animate-pulse rounded-md bg-muted" />
						<div className="h-4 w-80 animate-pulse rounded-md bg-muted" />
					</motion.div>
				</CardHeader>
				<CardContent>
					<motion.div
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.4, delay: 0.4 }}
						className="space-y-4"
					>
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
										<motion.div
											key={i}
											initial={{ opacity: 0, x: -10 }}
											animate={{ opacity: 1, x: 0 }}
											transition={{ duration: 0.3, delay: 0.5 + i * 0.1 }}
											className="grid grid-cols-7 items-center gap-4"
										>
											<Skeleton className="h-4 w-24" />
											<Skeleton className="h-4 w-32" />
											<Skeleton className="h-4 w-20" />
											<Skeleton className="h-4 w-16" />
											<Skeleton className="h-6 w-16 rounded-full" />
											<Skeleton className="h-4 w-8" />
											<Skeleton className="size-8 rounded" />
										</motion.div>
									))}
								</div>
							</div>
						</div>

						{/* Pagination skeleton */}
						<motion.div
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.3, delay: 1.0 }}
							className="flex items-center justify-between py-4"
						>
							<Skeleton className="h-4 w-32" />
							<div className="flex items-center space-x-2">
								<Skeleton className="h-8 w-20" />
								<Skeleton className="h-8 w-16" />
							</div>
						</motion.div>
					</motion.div>
				</CardContent>
			</Card>
		</motion.div>
	);
};

export default ServiceProvidersLoading;
