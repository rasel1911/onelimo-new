import { AlertCircle, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface LocationErrorProps {
	title?: string;
	message?: string;
	onRetry?: () => void;
}

export const LocationError = ({
	title = "Error Loading Locations",
	message = "Failed to load location data. Please try refreshing the page.",
	onRetry,
}: LocationErrorProps) => {
	return (
		<Card>
			<CardHeader className="text-center">
				<div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
					<AlertCircle className="size-6 text-red-600 dark:text-red-400" />
				</div>
				<CardTitle className="text-xl">{title}</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4 text-center">
				<p className="text-sm text-muted-foreground">{message}</p>
				{onRetry && (
					<Button onClick={onRetry} variant="outline">
						<RefreshCw className="mr-2 size-4" />
						Try Again
					</Button>
				)}
			</CardContent>
		</Card>
	);
};
