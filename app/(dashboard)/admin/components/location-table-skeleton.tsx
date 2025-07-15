"use client";

import { motion } from "framer-motion";

import { Skeleton } from "@/components/ui/skeleton";

export const LocationTableSkeleton = () => {
	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.3 }}
			className="space-y-4"
		>
			{/* Search bar skeleton */}
			<motion.div
				initial={{ opacity: 0, y: -10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.3, delay: 0.1 }}
				className="flex items-center gap-2"
			>
				<Skeleton className="h-10 w-64" />
			</motion.div>

			{/* Table skeleton */}
			<motion.div
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.4, delay: 0.2 }}
				className="rounded-md border"
			>
				<div className="p-4">
					{/* Table header */}
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ duration: 0.3, delay: 0.3 }}
						className="grid grid-cols-4 gap-4 border-b pb-4"
					>
						<Skeleton className="h-4 w-16" />
						<Skeleton className="h-4 w-20" />
						<Skeleton className="h-4 w-24" />
						<Skeleton className="h-4 w-16" />
					</motion.div>

					{/* Table rows */}
					<div className="space-y-3 pt-4">
						{Array.from({ length: 8 }).map((_, i) => (
							<motion.div
								key={i}
								initial={{ opacity: 0, x: -10 }}
								animate={{ opacity: 1, x: 0 }}
								transition={{ duration: 0.3, delay: 0.4 + i * 0.1 }}
								className="grid grid-cols-4 items-center gap-4"
							>
								<div className="flex items-center gap-2">
									<Skeleton className="size-4" />
									<Skeleton className="h-4 w-24" />
								</div>
								<div className="flex flex-wrap gap-1">
									<Skeleton className="h-6 w-12 rounded-md" />
									<Skeleton className="h-6 w-16 rounded-md" />
									<Skeleton className="h-6 w-14 rounded-md" />
								</div>
								<div className="ml-5">
									<Skeleton className="h-6 w-8 rounded-md" />
								</div>
								<div className="flex justify-end">
									<Skeleton className="size-8 rounded" />
								</div>
							</motion.div>
						))}
					</div>
				</div>
			</motion.div>

			{/* Pagination skeleton */}
			<motion.div
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.3, delay: 1.2 }}
				className="flex items-center justify-between py-4"
			>
				<Skeleton className="h-4 w-32" />
				<div className="flex items-center space-x-2">
					<Skeleton className="h-8 w-20" />
					<Skeleton className="h-8 w-16" />
				</div>
			</motion.div>
		</motion.div>
	);
};
