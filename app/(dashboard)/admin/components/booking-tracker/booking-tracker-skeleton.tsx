import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function BookingTrackerSkeleton() {
	return (
		<Card className="col-span-3">
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<Skeleton className="h-7 w-64" />
						<Skeleton className="mt-2 h-4 w-80" />
					</div>
					<Skeleton className="h-10 w-[400px]" />
				</div>
			</CardHeader>
			<CardContent>
				<div className="flex flex-col space-y-4">
					<div className="flex items-center justify-between">
						<div>
							<Skeleton className="h-6 w-32" />
							<Skeleton className="mt-1 h-4 w-48" />
						</div>
						<Skeleton className="h-6 w-20" />
					</div>
					<div className="mt-8 space-y-8">
						{Array.from({ length: 8 }).map((_, i) => (
							<div key={i} className="flex items-start">
								<Skeleton className="size-12 rounded-full" />
								<div className="ml-4 flex-1">
									<Skeleton className="h-5 w-24" />
									<Skeleton className="mt-1 h-3 w-32" />
								</div>
							</div>
						))}
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
