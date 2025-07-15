"use client";

import { motion } from "framer-motion";
import { Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const LocationFormSkeleton = () => {
	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
			className="flex min-h-[calc(100vh-4rem)] flex-row items-center justify-center"
		>
			<Card className="w-full max-w-xl">
				<CardHeader>
					<motion.div
						initial={{ opacity: 0, x: -20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.4, delay: 0.1 }}
					>
						<CardTitle>
							<Skeleton className="h-6 w-32" />
						</CardTitle>
						<CardDescription>
							<Skeleton className="mt-1 h-4 w-64" />
						</CardDescription>
					</motion.div>
				</CardHeader>
				<CardContent className="space-y-6">
					{/* City Field */}
					<motion.div
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.3, delay: 0.2 }}
						className="space-y-2"
					>
						<Skeleton className="h-5 w-20" />
						<Skeleton className="h-10 w-full" />
					</motion.div>

					{/* Postcodes Section */}
					<motion.div
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.3, delay: 0.3 }}
						className="space-y-4"
					>
						<div className="flex items-center justify-between">
							<Skeleton className="h-5 w-20" />
							<Button variant="outline" size="sm" disabled>
								<Plus className="mr-2 size-4" />
								Add Multiple
							</Button>
						</div>

						<div className="space-y-2">
							{Array.from({ length: 3 }).map((_, i) => (
								<motion.div
									key={i}
									initial={{ opacity: 0, x: -10 }}
									animate={{ opacity: 1, x: 0 }}
									transition={{ duration: 0.3, delay: 0.4 + i * 0.1 }}
									className="flex items-center gap-2"
								>
									<div className="flex-1">
										<Skeleton className="h-10 w-full" />
									</div>
									<Button variant="outline" size="icon" disabled>
										<X className="size-4" />
									</Button>
								</motion.div>
							))}
						</div>
					</motion.div>
				</CardContent>

				<CardFooter className="flex justify-between">
					<motion.div
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.3, delay: 0.8 }}
					>
						<Button variant="outline" disabled>
							Cancel
						</Button>
					</motion.div>
					<motion.div
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.3, delay: 0.9 }}
					>
						<Skeleton className="h-10 w-32" />
					</motion.div>
				</CardFooter>
			</Card>
		</motion.div>
	);
};

export default LocationFormSkeleton;
