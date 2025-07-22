"use client";

import { motion } from "framer-motion";

import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const RegistrationFormSkeleton = () => {
	return (
		<div className="container mx-auto py-10">
			<div className="mx-auto max-w-5xl">
				<div className="mb-8 text-center">
					<Skeleton className="mx-auto mb-2 h-8 w-64" />
					<Skeleton className="mx-auto h-4 w-96" />
				</div>

				<div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
					<div className="col-span-1 lg:col-span-2">
						<Card>
							<CardHeader>
								<CardTitle>
									<Skeleton className="h-6 w-48" />
								</CardTitle>
								<CardDescription>
									<Skeleton className="h-4 w-72" />
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-6">
								{/* Company Information */}
								<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
									<div className="space-y-2">
										<Skeleton className="h-4 w-24" />
										<Skeleton className="h-10 w-full" />
									</div>
									<div className="space-y-2">
										<Skeleton className="h-4 w-24" />
										<Skeleton className="h-10 w-full" />
									</div>
								</div>

								<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
									<div className="space-y-2">
										<Skeleton className="h-4 w-24" />
										<Skeleton className="h-10 w-full" />
										<Skeleton className="h-3 w-48" />
									</div>
									<div className="space-y-2">
										<Skeleton className="h-4 w-28" />
										<Skeleton className="h-10 w-full" />
										<Skeleton className="h-3 w-56" />
									</div>
								</div>

								<div className="h-px w-full bg-border" />

								{/* Service Types */}
								<div className="space-y-4">
									<div>
										<Skeleton className="mb-2 h-4 w-24" />
										<Skeleton className="mb-4 h-3 w-64" />
									</div>
									<div className="grid grid-cols-2 gap-2 md:grid-cols-3">
										{[...Array(6)].map((_, i) => (
											<motion.div
												key={i}
												initial={{ opacity: 0, scale: 0.9 }}
												animate={{ opacity: 1, scale: 1 }}
												transition={{ delay: i * 0.1 }}
											>
												<Skeleton className="h-10 w-full" />
											</motion.div>
										))}
									</div>
								</div>

								<div className="h-px w-full bg-border" />

								{/* Advanced Section */}
								<div className="space-y-4">
									<div className="flex items-center gap-2">
										<Skeleton className="size-4" />
										<Skeleton className="h-4 w-32" />
									</div>
								</div>
							</CardContent>
							<CardFooter className="flex justify-between border-t pt-6">
								<Skeleton className="h-10 w-20" />
								<Skeleton className="h-10 w-32" />
							</CardFooter>
						</Card>
					</div>

					{/* Help Box */}
					<div className="hidden lg:block">
						<div className="sticky top-8 rounded-lg border bg-card p-6 shadow-sm">
							<div className="mb-4 flex items-center gap-2">
								<Skeleton className="size-5" />
								<Skeleton className="h-5 w-32" />
							</div>
							<div className="space-y-4">
								{[...Array(4)].map((_, i) => (
									<div key={i} className="space-y-2">
										<Skeleton className="h-4 w-full" />
										<Skeleton className="h-4 w-3/4" />
									</div>
								))}
								<Skeleton className="h-4 w-5/6" />
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
