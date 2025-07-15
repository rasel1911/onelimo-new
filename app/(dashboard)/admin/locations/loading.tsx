"use client";

import { motion } from "framer-motion";
import { Plus } from "lucide-react";

import { LocationTableSkeleton } from "@/app/(dashboard)/admin/components/location-table-skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const LocationsLoading = () => {
	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.3 }}
			className="flex flex-col gap-6"
		>
			<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
				<motion.div
					initial={{ opacity: 0, x: -20 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ duration: 0.4, delay: 0.1 }}
				>
					<div className="mb-2 h-9 w-32 animate-pulse rounded-md bg-muted" />
					<div className="h-5 w-56 animate-pulse rounded-md bg-muted" />
				</motion.div>
				<motion.div
					initial={{ opacity: 0, x: 20 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ duration: 0.4, delay: 0.2 }}
				>
					<Button disabled>
						<Plus className="mr-2 size-4" />
						Add Location
					</Button>
				</motion.div>
			</div>

			<Card>
				<CardHeader>
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ duration: 0.3, delay: 0.3 }}
						className="space-y-2"
					>
						<div className="h-6 w-32 animate-pulse rounded-md bg-muted" />
						<div className="h-4 w-72 animate-pulse rounded-md bg-muted" />
					</motion.div>
				</CardHeader>
				<CardContent>
					<motion.div
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.4, delay: 0.4 }}
					>
						<LocationTableSkeleton />
					</motion.div>
				</CardContent>
			</Card>
		</motion.div>
	);
};

export default LocationsLoading;
