"use client";

import { motion } from "framer-motion";
import { MapPin, Pencil } from "lucide-react";

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

export const LocationDetailsSkeleton = () => {
	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
			className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center"
		>
			<Card className="w-full max-w-xl">
				<CardHeader>
					<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
						<motion.div
							initial={{ opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.4, delay: 0.1 }}
						>
							<CardTitle className="flex items-center gap-2">
								<MapPin className="size-5 text-primary" />
								<Skeleton className="h-6 w-32" />
							</CardTitle>
							<CardDescription>
								<Skeleton className="mt-1 h-4 w-48" />
							</CardDescription>
						</motion.div>
						<motion.div
							initial={{ opacity: 0, x: 20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.4, delay: 0.2 }}
						>
							<Button size="sm" disabled>
								<Pencil className="mr-2 size-4" />
								Edit
							</Button>
						</motion.div>
					</div>
				</CardHeader>
				<CardContent className="space-y-6">
					<motion.div
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.3, delay: 0.3 }}
					>
						<h3 className="mb-1 text-sm font-medium text-muted-foreground">City</h3>
						<Skeleton className="h-7 w-24" />
					</motion.div>

					<motion.div
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.3, delay: 0.4 }}
					>
						<h3 className="mb-1 text-sm font-medium text-muted-foreground">Postcodes</h3>
						<div className="rounded-md bg-muted p-3">
							<div className="flex flex-wrap gap-2">
								{Array.from({ length: 6 }).map((_, i) => (
									<motion.div
										key={i}
										initial={{ opacity: 0, scale: 0.8 }}
										animate={{ opacity: 1, scale: 1 }}
										transition={{ duration: 0.2, delay: 0.5 + i * 0.1 }}
									>
										<Skeleton className="h-6 w-16 rounded-md" />
									</motion.div>
								))}
							</div>
						</div>
					</motion.div>
				</CardContent>
				<CardFooter className="flex justify-between border-t pt-6">
					<motion.div
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.3, delay: 0.8 }}
					>
						<Button variant="outline" disabled>
							Back to Locations
						</Button>
					</motion.div>
				</CardFooter>
			</Card>
		</motion.div>
	);
};
