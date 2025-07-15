import { ArrowLeft, MoreVertical, Plus, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
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

const InvitationsLoading = () => {
	return (
		<div className="container py-8">
			<div className="mb-6">
				<Button variant="outline" size="sm" className="mb-4" disabled>
					<ArrowLeft className="mr-2 size-4" />
					Back to Service Providers
				</Button>
				<div className="flex flex-col md:flex-row md:items-center md:justify-between">
					<div>
						<h1 className="text-3xl font-bold tracking-tight">Partner Invitation Tokens</h1>
						<p className="text-muted-foreground">
							View and manage all partner registration invitations
						</p>
					</div>
					<div className="mt-4 flex gap-2 md:mt-0">
						<Button variant="ghost" disabled>
							<RefreshCw className="mr-2 size-4" />
							Refresh
						</Button>
						<Button variant="outline" disabled>
							Clean Up Expired Tokens
						</Button>
						<Button disabled>
							<Plus className="mr-2 size-4" />
							New Invitation
						</Button>
					</div>
				</div>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>All Invitation Tokens</CardTitle>
					<CardDescription>
						<Skeleton className="h-4 w-64" />
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Email</TableHead>
								<TableHead>Status</TableHead>
								<TableHead>Created</TableHead>
								<TableHead>Expires</TableHead>
								<TableHead className="w-[50px]">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{Array.from({ length: 5 }).map((_, index) => (
								<TableRow key={index}>
									<TableCell>
										<Skeleton className="h-4 w-32" />
									</TableCell>
									<TableCell>
										<Skeleton className="h-6 w-16" />
									</TableCell>
									<TableCell>
										<Skeleton className="h-4 w-24" />
									</TableCell>
									<TableCell>
										<Skeleton className="h-4 w-28" />
									</TableCell>
									<TableCell>
										<Button variant="ghost" size="icon" className="size-8" disabled>
											<MoreVertical className="size-4" />
										</Button>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</CardContent>
			</Card>
		</div>
	);
};

export default InvitationsLoading;
