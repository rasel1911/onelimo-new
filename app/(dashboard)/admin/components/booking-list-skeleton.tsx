import { Skeleton } from "@/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

export function BookingListSkeleton() {
	return (
		<div className="rounded-md border">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>ID</TableHead>
						<TableHead>Customer</TableHead>
						<TableHead>Service</TableHead>
						<TableHead>Route</TableHead>
						<TableHead>Date</TableHead>
						<TableHead>Status</TableHead>
						<TableHead className="w-[80px]">Actions</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{Array.from({ length: 5 }).map((_, index) => (
						<TableRow key={index}>
							<TableCell>
								<Skeleton className="h-4 w-20" />
							</TableCell>
							<TableCell>
								<div className="space-y-2">
									<Skeleton className="h-4 w-32" />
									<Skeleton className="h-3 w-20" />
								</div>
							</TableCell>
							<TableCell>
								<Skeleton className="h-4 w-24" />
							</TableCell>
							<TableCell>
								<div className="space-y-1">
									<Skeleton className="h-3 w-36" />
									<Skeleton className="h-3 w-32" />
								</div>
							</TableCell>
							<TableCell>
								<Skeleton className="h-4 w-20" />
							</TableCell>
							<TableCell>
								<Skeleton className="h-6 w-16 rounded-full" />
							</TableCell>
							<TableCell>
								<Skeleton className="size-8 rounded" />
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}
