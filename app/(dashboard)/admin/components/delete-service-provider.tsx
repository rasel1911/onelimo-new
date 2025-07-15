"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { deleteServiceProviderAction } from "@/app/(dashboard)/admin/service-providers/actions";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

interface DeleteServiceProviderProps {
	id: string;
}

export const DeleteServiceProvider = ({ id }: DeleteServiceProviderProps) => {
	const [open, setOpen] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const router = useRouter();

	async function handleDelete() {
		try {
			setIsDeleting(true);
			const result = await deleteServiceProviderAction(id);

			if (result.success) {
				toast.success("Service provider deleted successfully");
				router.refresh();
			} else {
				toast.error(result.error || "Failed to delete service provider");
			}
		} catch (error) {
			toast.error("Something went wrong. Please try again.");
		} finally {
			setIsDeleting(false);
			setOpen(false);
		}
	}

	return (
		<>
			<DropdownMenuItem
				className="text-red-600"
				onSelect={(e) => {
					e.preventDefault();
					setOpen(true);
				}}
			>
				Delete
			</DropdownMenuItem>

			<AlertDialog open={open} onOpenChange={setOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
						<AlertDialogDescription>
							This action cannot be undone. This will permanently delete the service provider from
							the database.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
						<AlertDialogAction
							disabled={isDeleting}
							onClick={(e) => {
								e.preventDefault();
								handleDelete();
							}}
							className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
						>
							{isDeleting ? "Deleting..." : "Delete"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
};
