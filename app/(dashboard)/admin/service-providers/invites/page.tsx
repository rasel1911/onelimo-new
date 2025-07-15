"use client";

import { format } from "date-fns";
import { ArrowLeft, MoreVertical, Plus, RefreshCw, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { InviteModal } from "@/app/(dashboard)/admin/components/invite-modal";
import { cleanupExpiredInvitationTokens } from "@/app/(partners)/actions/cleanup-expired-tokens";
import { deleteInvitationToken } from "@/app/(partners)/actions/delete-invitation-token";
import { getInvitationTokens } from "@/app/(partners)/actions/get-invitation-tokens";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { RegistrationToken } from "@/db/schema";

const InviteTokensPage = () => {
	const [tokens, setTokens] = useState<RegistrationToken[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [deletingTokenId, setDeletingTokenId] = useState<string | null>(null);

	const fetchTokens = async () => {
		setIsLoading(true);
		try {
			const result = await getInvitationTokens();
			setTokens(result);
		} catch (error) {
			console.error("Error fetching tokens:", error);
			toast.error("Failed to fetch invitation tokens");
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchTokens();
	}, []);

	const handleCleanup = async () => {
		try {
			const result = await cleanupExpiredInvitationTokens();
			if (result.success) {
				fetchTokens();
				toast.success("Expired tokens cleaned up successfully");
			} else {
				toast.error(result.message || "Failed to clean up tokens");
			}
		} catch (error) {
			console.error("Error cleaning up tokens:", error);
			toast.error("Failed to clean up tokens");
		}
	};

	const handleDeleteToken = async (id: string) => {
		try {
			setDeletingTokenId(id);
			const result = await deleteInvitationToken(id);

			if (result.success) {
				toast.success("Token deleted successfully");
				fetchTokens();
			} else {
				toast.error(result.message || "Failed to delete token");
			}
		} catch (error) {
			console.error("Error deleting token:", error);
			toast.error("An error occurred while deleting the token");
		} finally {
			setDeletingTokenId(null);
		}
	};

	return (
		<div className="container py-8">
			<div className="mb-6">
				<Link href="/admin/service-providers" passHref>
					<Button variant="outline" size="sm" className="mb-4">
						<ArrowLeft className="mr-2 size-4" />
						Back to Service Providers
					</Button>
				</Link>
				<div className="flex flex-col md:flex-row md:items-center md:justify-between">
					<div>
						<h1 className="text-3xl font-bold tracking-tight">Partner Invitation Tokens</h1>
						<p className="text-muted-foreground">
							View and manage all partner registration invitations
						</p>
					</div>
					<div className="mt-4 flex gap-2 md:mt-0">
						<Button variant="ghost" onClick={fetchTokens} disabled={isLoading}>
							<RefreshCw className={`mr-2 size-4 ${isLoading ? "animate-spin" : ""}`} />
							Refresh
						</Button>
						<Button variant="outline" onClick={handleCleanup}>
							Clean Up Expired Tokens
						</Button>
						<InviteModal
							trigger={
								<Button>
									<Plus className="mr-2 size-4" />
									New Invitation
								</Button>
							}
							onSuccess={fetchTokens}
						/>
					</div>
				</div>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>All Invitation Tokens</CardTitle>
					<CardDescription>
						Showing {tokens.length} invitation tokens. Active tokens can be used to register new
						partners.
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
							{isLoading ? (
								<TableRow>
									<TableCell colSpan={5} className="text-center">
										<div className="flex justify-center py-4">
											<RefreshCw className="size-6 animate-spin text-muted-foreground" />
										</div>
									</TableCell>
								</TableRow>
							) : tokens.length === 0 ? (
								<TableRow>
									<TableCell colSpan={5} className="text-center">
										No invitation tokens found.
									</TableCell>
								</TableRow>
							) : (
								tokens.map((token) => {
									const isExpired = new Date() > token.expiresAt;
									const isDeleting = deletingTokenId === token.id;

									return (
										<TableRow key={token.id}>
											<TableCell>{token.email || "Not specified"}</TableCell>
											<TableCell>
												{token.isUsed ? (
													<Badge variant="secondary">Used</Badge>
												) : isExpired ? (
													<Badge variant="destructive">Expired</Badge>
												) : (
													<Badge variant="default" className="bg-green-500 hover:bg-green-600">
														Active
													</Badge>
												)}
											</TableCell>
											<TableCell>{format(token.createdAt, "PPP")}</TableCell>
											<TableCell>{format(token.expiresAt, "PPP p")}</TableCell>
											<TableCell>
												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<Button
															variant="ghost"
															size="icon"
															className="size-8"
															disabled={isDeleting}
														>
															{isDeleting ? (
																<RefreshCw className="size-4 animate-spin" />
															) : (
																<MoreVertical className="size-4" />
															)}
														</Button>
													</DropdownMenuTrigger>
													<DropdownMenuContent align="end">
														<DropdownMenuItem
															className="text-destructive"
															onClick={() => handleDeleteToken(token.id)}
														>
															<Trash2 className="mr-2 size-4" />
															Delete
														</DropdownMenuItem>
													</DropdownMenuContent>
												</DropdownMenu>
											</TableCell>
										</TableRow>
									);
								})
							)}
						</TableBody>
					</Table>
				</CardContent>
			</Card>
		</div>
	);
};

export default InviteTokensPage;
