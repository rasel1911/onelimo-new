"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function BookingsLoading() {
	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<Skeleton className="h-5 w-60" />
				<Tabs defaultValue="tracker">
					<TabsList>
						<TabsTrigger value="tracker" disabled>
							<Skeleton className="h-4 w-20" />
						</TabsTrigger>
						<TabsTrigger value="list" disabled>
							<Skeleton className="h-4 w-20" />
						</TabsTrigger>
					</TabsList>
				</Tabs>
			</div>

			<Card className="col-span-3">
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<CardTitle>Booking Process Tracker</CardTitle>
							<CardDescription>Track the status of service booking requests</CardDescription>
						</div>
						<Tabs defaultValue="loading" className="w-[400px]">
							<TabsList className="grid grid-cols-3">
								{[1, 2, 3].map((index) => (
									<TabsTrigger key={index} value={`loading-${index}`} disabled>
										<Skeleton className="h-4 w-16" />
									</TabsTrigger>
								))}
							</TabsList>
						</Tabs>
					</div>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col space-y-4">
						<div className="flex items-center justify-between">
							<div>
								<Skeleton className="mb-2 h-5 w-48" />
								<Skeleton className="h-4 w-32" />
							</div>
							<Skeleton className="h-6 w-24 rounded-full" />
						</div>

						<div className="relative mt-8">
							{/* Progress line */}
							<div className="absolute inset-y-0 left-6 w-0.5 bg-slate-200 dark:bg-slate-700" />

							{/* Steps */}
							<div className="space-y-8">
								{[1, 2, 3, 4, 5, 6].map((step) => (
									<div key={step} className="relative flex items-center">
										{/* Step indicator */}
										<Skeleton className="absolute left-0 size-12 rounded-full" />

										{/* Step content */}
										<div className="ml-16 flex-1">
											<div className="flex items-center justify-between">
												<div>
													<Skeleton className="mb-2 h-4 w-24" />
													<Skeleton className="h-3 w-32" />
												</div>
												<div className="flex items-center gap-2">
													<Skeleton className="h-6 w-20 rounded-full" />
													<Skeleton className="size-8 rounded-md" />
												</div>
											</div>
										</div>
									</div>
								))}
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
