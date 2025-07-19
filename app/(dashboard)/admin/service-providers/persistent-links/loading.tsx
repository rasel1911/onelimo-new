import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

const PersistentLinksLoading = () => {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Persistent Links</CardTitle>
				<CardDescription>
					These links never expire and can be shared across multiple communication channels.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Title</TableHead>
							<TableHead>Link ID</TableHead>
							<TableHead>URL</TableHead>
							<TableHead>Status</TableHead>
							<TableHead>Usage Count</TableHead>
							<TableHead>Created</TableHead>
							<TableHead className="text-right">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{Array.from({ length: 3 }).map((_, index) => (
							<TableRow key={index}>
								<TableCell>
									<div className="space-y-1">
										<Skeleton className="h-4 w-32" />
										<Skeleton className="h-3 w-48" />
									</div>
								</TableCell>
								<TableCell>
									<Skeleton className="h-6 w-20" />
								</TableCell>
								<TableCell>
									<div className="flex items-center space-x-2">
										<Skeleton className="h-8 w-48" />
										<Skeleton className="size-8" />
									</div>
								</TableCell>
								<TableCell>
									<Skeleton className="h-5 w-16" />
								</TableCell>
								<TableCell>
									<Skeleton className="h-4 w-8" />
								</TableCell>
								<TableCell>
									<Skeleton className="h-4 w-20" />
								</TableCell>
								<TableCell className="text-right">
									<Skeleton className="ml-auto size-8" />
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</CardContent>
		</Card>
	);
};

export default PersistentLinksLoading;
