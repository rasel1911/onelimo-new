"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function NotificationSkeleton() {
	return (
		<div className="space-y-4">
			{Array.from({ length: 3 }).map((_, i) => (
				<div key={i} className="flex items-center space-x-3 rounded-lg border p-3">
					<Skeleton className="size-10 rounded-full" />
					<div className="flex-1 space-y-2">
						<Skeleton className="h-4 w-32" />
						<Skeleton className="h-3 w-48" />
					</div>
					<Skeleton className="h-6 w-16" />
				</div>
			))}
		</div>
	);
}
