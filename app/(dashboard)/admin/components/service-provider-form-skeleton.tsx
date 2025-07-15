"use client";

import { motion } from "framer-motion";
import { ChevronDown, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const SkeletonInput = ({ className = "" }: { className?: string }) => (
	<motion.div
		initial={{ opacity: 0 }}
		animate={{ opacity: 1 }}
		transition={{ duration: 0.3 }}
		className={`space-y-2 ${className}`}
	>
		<Skeleton className="h-4 w-16" />
		<Skeleton className="h-10 w-full" />
	</motion.div>
);

const SkeletonSelect = ({
	className = "",
	withButton = false,
}: {
	className?: string;
	withButton?: boolean;
}) => (
	<motion.div
		initial={{ opacity: 0 }}
		animate={{ opacity: 1 }}
		transition={{ duration: 0.3 }}
		className={`space-y-2 ${className}`}
	>
		<Skeleton className="h-4 w-20" />
		<div className="flex items-center gap-2">
			<Skeleton className="h-10 flex-1" />
			{withButton && (
				<Button variant="outline" disabled>
					<Plus className="size-4" />
				</Button>
			)}
		</div>
	</motion.div>
);

export const ServiceProviderFormSkeleton = () => {
	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
			className="flex flex-col gap-6"
		>
			{/* Header */}
			<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
				<div>
					<motion.div
						initial={{ opacity: 0, x: -20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.4, delay: 0.1 }}
					>
						<Skeleton className="mb-2 h-9 w-64" />
						<Skeleton className="h-5 w-48" />
					</motion.div>
				</div>
			</div>

			{/* Main Form Card */}
			<Card>
				<CardHeader>
					<CardTitle>
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ duration: 0.3, delay: 0.2 }}
						>
							<Skeleton className="h-6 w-48" />
						</motion.div>
					</CardTitle>
				</CardHeader>
				<CardContent>
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ duration: 0.4, delay: 0.3 }}
						className="space-y-6"
					>
						{/* Basic Fields Grid */}
						<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
							<SkeletonInput />
							<SkeletonInput />
							<SkeletonInput />
							<SkeletonSelect withButton />
						</div>

						{/* Service Types Section */}
						<motion.div
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.3, delay: 0.4 }}
							className="space-y-4"
						>
							<div className="space-y-2">
								<Skeleton className="h-4 w-24" />
								<div className="grid grid-cols-2 gap-2 md:grid-cols-3">
									<Skeleton className="h-10 w-full" />
									<Skeleton className="h-10 w-full" />
									<Skeleton className="h-10 w-full" />
								</div>
							</div>
						</motion.div>

						{/* Areas Covered Section */}
						<motion.div
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.3, delay: 0.5 }}
							className="space-y-4"
						>
							<div className="space-y-2">
								<Skeleton className="h-4 w-28" />
								<div className="flex flex-wrap gap-2">
									<Skeleton className="h-8 w-20" />
									<Skeleton className="h-8 w-24" />
									<Skeleton className="h-8 w-16" />
								</div>
								<div className="flex gap-2">
									<Skeleton className="h-10 flex-1" />
									<Skeleton className="h-10 w-20" />
								</div>
							</div>
						</motion.div>

						{/* Advanced Details Collapsible Section */}
						<motion.div
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.3, delay: 0.6 }}
							className="col-span-2 mt-4 space-y-2"
						>
							<div className="flex items-center justify-between">
								<Skeleton className="h-6 w-36" />
								<Button variant="ghost" size="sm" className="w-9 p-0" disabled>
									<ChevronDown className="size-4" />
								</Button>
							</div>

							{/* Advanced Fields (shown as if expanded) */}
							<motion.div
								initial={{ opacity: 0, height: 0 }}
								animate={{ opacity: 1, height: "auto" }}
								transition={{ duration: 0.4, delay: 0.7 }}
								className="space-y-4"
							>
								<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
									<SkeletonSelect />
									<SkeletonSelect />
									<SkeletonSelect />
									<SkeletonSelect />
								</div>
							</motion.div>
						</motion.div>

						{/* Action Buttons */}
						<motion.div
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.3, delay: 0.8 }}
							className="flex justify-end gap-4"
						>
							<Button variant="outline" disabled>
								Cancel
							</Button>
							<Skeleton className="h-10 w-32" />
						</motion.div>
					</motion.div>
				</CardContent>
			</Card>
		</motion.div>
	);
};
