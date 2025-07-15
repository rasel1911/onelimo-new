import { ArrowRight } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const AdminDashboardLoading = () => {
	return (
		<div className="space-y-6">
			<div className="mb-6">
				<Skeleton className="mb-2 h-8 w-48" />
				<Skeleton className="h-4 w-96" />
			</div>

			{/* Dashboard Stats */}
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
							<div className="flex h-8 w-full items-center justify-between rounded-md bg-muted/50 px-3">
								<div className="flex items-center gap-1">
									<Skeleton className="size-3" />
									<Skeleton className="h-3 w-12" />
								</div>
								<ArrowRight className="size-3 text-muted-foreground/50" />
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			{/* Recent Activity */}
			<div className="grid gap-6 md:grid-cols-2">
				{Array.from({ length: 2 }).map((_, i) => (
					<Card key={i}>
						<CardHeader>
							<Skeleton className="h-6 w-32" />
							<Skeleton className="h-4 w-48" />
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{Array.from({ length: 3 }).map((_, j) => (
									<div key={j} className="flex items-center justify-between">
										<div className="space-y-1">
											<Skeleton className="h-4 w-32" />
											<Skeleton className="h-3 w-24" />
										</div>
										<Skeleton className="h-6 w-16" />
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			{/* Workflow Overview */}
			<div className="grid gap-6 md:grid-cols-2">
				{Array.from({ length: 2 }).map((_, i) => (
					<Card key={i}>
						<CardHeader>
							<Skeleton className="h-6 w-32" />
							<Skeleton className="h-4 w-48" />
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								<Skeleton className="h-8 w-20" />
								<Skeleton className="h-2 w-full" />
								<Skeleton className="h-4 w-32" />
							</div>
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
};

export default AdminDashboardLoading;
