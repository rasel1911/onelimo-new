"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const ServiceProviderDetailsSkeleton = () => {
	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
			className="flex flex-col gap-6"
		>
			{/* Header */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-4">
					<Button variant="outline" size="icon" disabled>
						<ArrowLeft className="size-4" />
					</Button>
					<motion.div
						initial={{ opacity: 0, x: -20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.4, delay: 0.1 }}
					>
						<Skeleton className="mb-2 h-9 w-64" />
						<Skeleton className="h-5 w-48" />
					</motion.div>
				</div>
				<motion.div
					initial={{ opacity: 0, x: 20 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ duration: 0.4, delay: 0.2 }}
					className="flex items-center gap-2"
				>
					<Button variant="outline" disabled>
						<Pencil className="mr-2 size-4" />
						Edit
					</Button>
					<Skeleton className="h-10 w-20" />
				</motion.div>
			</div>

			{/* Content Grid */}
			<div className="grid gap-6 md:grid-cols-2">
				{/* Provider Information Card */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.4, delay: 0.3 }}
				>
					<Card>
						<CardHeader>
							<CardTitle>Provider Information</CardTitle>
							<CardDescription>Basic details about this service provider</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid grid-cols-2 gap-4">
								{Array.from({ length: 6 }).map((_, i) => (
									<motion.div
										key={i}
										initial={{ opacity: 0, x: -10 }}
										animate={{ opacity: 1, x: 0 }}
										transition={{ duration: 0.3, delay: 0.4 + i * 0.1 }}
									>
										<Skeleton className="mb-2 h-4 w-16" />
										<Skeleton className="h-5 w-24" />
									</motion.div>
								))}
							</div>
						</CardContent>
					</Card>
				</motion.div>

				{/* Location Card */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.4, delay: 0.4 }}
				>
					<Card>
						<CardHeader>
							<CardTitle>Location</CardTitle>
							<CardDescription>Associated location information</CardDescription>
						</CardHeader>
						<CardContent>
							<motion.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								transition={{ duration: 0.3, delay: 0.7 }}
							>
								<Skeleton className="mb-2 h-4 w-20" />
								<Skeleton className="h-5 w-32" />
							</motion.div>
						</CardContent>
					</Card>
				</motion.div>
			</div>
		</motion.div>
	);
};
