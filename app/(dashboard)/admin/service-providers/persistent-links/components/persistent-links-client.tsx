"use client";

import { format } from "date-fns";
import { Check, Copy, Edit, Eye, EyeOff, MoreVertical, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { EditPersistentLinkModal } from "@/app/(dashboard)/admin/components/edit-persistent-link-modal";
import {
	togglePersistentRegistrationLinkStatus,
	deletePersistentRegistrationLink,
} from "@/app/(partners)/actions/persistent-link-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { PersistentRegistrationLink } from "@/db/schema";
import { generatePersistentLinkUrl } from "@/lib/utils/persistent-link-utils";

interface PersistentLinksClientProps {
	initialLinks: PersistentRegistrationLink[];
}

export function PersistentLinksClient({ initialLinks }: PersistentLinksClientProps) {
	const [updatingLinkId, setUpdatingLinkId] = useState<string | null>(null);
	const [deletingLinkId, setDeletingLinkId] = useState<string | null>(null);
	const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null);

	const handleToggleStatus = async (id: string, currentStatus: boolean) => {
		try {
			setUpdatingLinkId(id);
			const result = await togglePersistentRegistrationLinkStatus(id, !currentStatus);

			if (result.success) {
				toast.success(result.message);
				// Server action will automatically revalidate the page
			} else {
				toast.error(result.message || "Failed to update link status");
			}
		} catch (error) {
			console.error("Error toggling link status:", error);
			toast.error("Failed to update link status");
		} finally {
			setUpdatingLinkId(null);
		}
	};

	const handleDeleteLink = async (id: string) => {
		try {
			setDeletingLinkId(id);
			const result = await deletePersistentRegistrationLink(id);

			if (result.success) {
				toast.success(result.message);
				// Server action will automatically revalidate the page
			} else {
				toast.error(result.message || "Failed to delete link");
			}
		} catch (error) {
			console.error("Error deleting link:", error);
			toast.error("An error occurred while deleting the link");
		} finally {
			setDeletingLinkId(null);
		}
	};

	const handleCopyLink = async (linkId: string) => {
		try {
			const url = generatePersistentLinkUrl(linkId);
			await navigator.clipboard.writeText(url);
			setCopiedLinkId(linkId);
			toast.success("Link copied to clipboard!");
			setTimeout(() => setCopiedLinkId(null), 2000);
		} catch (error) {
			console.error("Error copying link:", error);
			toast.error("Failed to copy link");
		}
	};

	return (
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
				{initialLinks.map((link) => (
					<TableRow key={link.id}>
						<TableCell>
							<div>
								<div className="font-medium">{link.title}</div>
								{link.description && (
									<div className="text-sm text-muted-foreground">{link.description}</div>
								)}
							</div>
						</TableCell>
						<TableCell>
							<code className="rounded bg-muted px-2 py-1 text-sm">{link.linkId}</code>
						</TableCell>
						<TableCell>
							<div className="flex items-center space-x-2">
								<Input
									readOnly
									value={generatePersistentLinkUrl(link.linkId)}
									className="max-w-xs font-mono text-xs"
								/>
								<Button variant="ghost" size="sm" onClick={() => handleCopyLink(link.linkId)}>
									{copiedLinkId === link.linkId ? (
										<Check className="size-4 text-green-500" />
									) : (
										<Copy className="size-4" />
									)}
								</Button>
							</div>
						</TableCell>
						<TableCell>
							<Badge variant={link.isActive ? "default" : "secondary"}>
								{link.isActive ? "Active" : "Inactive"}
							</Badge>
						</TableCell>
						<TableCell>
							<span className="font-mono text-sm">{link.usageCount}</span>
						</TableCell>
						<TableCell>
							<span className="text-sm text-muted-foreground">
								{format(new Date(link.createdAt), "MMM d, yyyy")}
							</span>
						</TableCell>
						<TableCell className="text-right">
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="ghost" size="sm">
										<MoreVertical className="size-4" />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end">
									<DropdownMenuItem onClick={() => handleCopyLink(link.linkId)}>
										<Copy className="mr-2 size-4" />
										Copy Link
									</DropdownMenuItem>
									<EditPersistentLinkModal
										link={link}
										trigger={
											<DropdownMenuItem onSelect={(e) => e.preventDefault()}>
												<Edit className="mr-2 size-4" />
												Edit
											</DropdownMenuItem>
										}
										onSuccess={() => {
											// Modal handles revalidation internally
										}}
									/>
									<DropdownMenuItem
										onClick={() => handleToggleStatus(link.id, link.isActive)}
										disabled={updatingLinkId === link.id}
									>
										{link.isActive ? (
											<EyeOff className="mr-2 size-4" />
										) : (
											<Eye className="mr-2 size-4" />
										)}
										{link.isActive ? "Deactivate" : "Activate"}
									</DropdownMenuItem>
									<DropdownMenuSeparator />
									<DropdownMenuItem
										onClick={() => handleDeleteLink(link.id)}
										disabled={deletingLinkId === link.id}
										className="text-destructive"
									>
										<Trash2 className="mr-2 size-4" />
										Delete
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
}
