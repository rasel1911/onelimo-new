import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
	return <div className={cn("animate-pulse rounded-md bg-muted", className)} {...props} />;
}

function SkeletonCard({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
	return (
		<div className={cn("space-y-4 rounded-lg border p-6", className)} {...props}>
			<div className="space-y-2">
				<Skeleton className="h-5 w-1/3" />
				<Skeleton className="h-4 w-1/2" />
			</div>
			<div className="space-y-3">
				<div className="space-y-2">
					<Skeleton className="h-4 w-1/4" />
					<Skeleton className="h-9 w-full" />
					<Skeleton className="h-3 w-3/4" />
				</div>
				<div className="space-y-2">
					<Skeleton className="h-4 w-1/4" />
					<Skeleton className="h-9 w-full" />
					<Skeleton className="h-3 w-3/4" />
				</div>
				<div className="space-y-2">
					<Skeleton className="h-4 w-1/4" />
					<Skeleton className="h-9 w-full" />
					<Skeleton className="h-3 w-3/4" />
				</div>
			</div>
		</div>
	);
}

function SkeletonInput({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
	return (
		<div className={cn("space-y-2", className)} {...props}>
			<Skeleton className="h-4 w-1/4" />
			<Skeleton className="h-9 w-full" />
			<Skeleton className="h-3 w-3/4" />
		</div>
	);
}

function SkeletonSwitch({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
	return (
		<div className={cn("flex items-center justify-between", className)} {...props}>
			<div className="space-y-1">
				<Skeleton className="h-4 w-32" />
				<Skeleton className="h-3 w-48" />
			</div>
			<Skeleton className="h-6 w-11 rounded-full" />
		</div>
	);
}

export { Skeleton, SkeletonCard, SkeletonInput, SkeletonSwitch };
