import { Skeleton } from "@/components/ui/skeleton";

export const BookingFormSkeleton = () => {
	return (
		<div className="space-y-6 rounded-2xl border border-border bg-card p-6 shadow-lg backdrop-blur-sm">
			<div className="space-y-4">
				<div className="flex items-center space-x-2 pb-2">
					<Skeleton className="size-4" />
					<Skeleton className="h-6 w-32" />
				</div>
				<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
					<div className="space-y-3">
						<Skeleton className="h-4 w-24" />
						<div className="grid grid-cols-2 gap-3">
							<Skeleton className="h-10" />
							<Skeleton className="h-10" />
						</div>
					</div>
					<div className="space-y-3">
						<Skeleton className="h-4 w-24" />
						<div className="grid grid-cols-2 gap-3">
							<Skeleton className="h-10" />
							<Skeleton className="h-10" />
						</div>
					</div>
				</div>
			</div>
			<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
				<div className="space-y-3">
					<Skeleton className="h-4 w-32" />
					<Skeleton className="h-10" />
					<Skeleton className="h-4 w-32" />
					<Skeleton className="h-10" />
				</div>
				<div className="space-y-3">
					<Skeleton className="h-4 w-20" />
					<Skeleton className="h-10" />
					<Skeleton className="h-4 w-24" />
					<Skeleton className="h-10" />
				</div>
			</div>
			<div className="space-y-4">
				<Skeleton className="h-4 w-40" />
				<Skeleton className="h-20" />
				<Skeleton className="h-12 w-full" />
			</div>
		</div>
	);
};
