import { TrendingUp } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

import { StatusBadge } from "./status-badge";

interface WorkflowOverviewProps {
	workflowStatus: Array<{
		status: string;
		count: number;
	}>;
	completionRate: number;
}

export const WorkflowOverview = ({ workflowStatus, completionRate }: WorkflowOverviewProps) => {
	return (
		<div className="grid gap-6 md:grid-cols-2">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<TrendingUp className="size-5" />
						Workflow Status
					</CardTitle>
					<CardDescription>Current workflow distribution</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						{workflowStatus.length === 0 ? (
							<p className="text-sm text-muted-foreground">No workflow data available</p>
						) : (
							workflowStatus.map((status) => (
								<div key={status.status} className="flex items-center justify-between">
									<StatusBadge status={status.status} />
									<span className="text-sm font-medium">{status.count}</span>
								</div>
							))
						)}
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<TrendingUp className="size-5" />
						Completion Rate
					</CardTitle>
					<CardDescription>Success rate for last 30 days</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						<div className="text-3xl font-bold">{completionRate.toFixed(1)}%</div>
						<Progress value={completionRate} className="h-2" />
						<p className="text-sm text-muted-foreground">Workflows completed successfully</p>
					</div>
				</CardContent>
			</Card>
		</div>
	);
};
