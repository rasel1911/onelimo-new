import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface SectionLoadingProps {
	title?: string;
	rows?: number;
}

export const SectionLoading = ({ title = "Loading...", rows = 3 }: SectionLoadingProps) => {
	return (
		<Card>
			<CardHeader>
				<Skeleton className="h-6 w-32" />
				<Skeleton className="h-4 w-48" />
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					{Array.from({ length: rows }).map((_, i) => (
						<div key={i} className="flex items-center justify-between">
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
	);
};
