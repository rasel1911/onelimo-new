import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const StatsLoading = () => {
	return (
		<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
			{Array.from({ length: 6 }).map((_, i) => (
				<Card key={i} className="transition-all duration-200 hover:shadow-md">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<Skeleton className="h-4 w-20" />
						<Skeleton className="size-4" />
					</CardHeader>
					<CardContent>
						<Skeleton className="mb-1 h-8 w-16" />
						<Skeleton className="h-3 w-24" />
					</CardContent>
					<CardContent className="pt-2">
						<Skeleton className="h-8 w-full rounded-md" />
					</CardContent>
				</Card>
			))}
		</div>
	);
};
