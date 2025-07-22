"use client";

import { Trash2 } from "lucide-react";
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
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface DeleteServiceProviderButtonProps {
	id: string;
	onServiceProviderDeleted?: () => void;
}

export const DeleteServiceProviderButton = ({
	id,
	onServiceProviderDeleted,
}: DeleteServiceProviderButtonProps) => {
	const [isDeleting, setIsDeleting] = useState(false);
	const router = useRouter();

	async function handleDelete() {
		try {
			setIsDeleting(true);
			const result = await deleteServiceProviderAction(id);

			if (result.success) {
				toast.success("Service provider deleted successfully");
				if (onServiceProviderDeleted) {
					onServiceProviderDeleted();
				} else {
					router.push("/admin/service-providers");
				}
			} else {
				toast.error(result.error || "Failed to delete service provider");
			}
		} catch (error) {
			toast.error("Something went wrong. Please try again.");
		} finally {
			setIsDeleting(false);
		}
	}

	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>
				<Button variant="destructive">
					<Trash2 className="mr-2 size-4" />
					Delete
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
					<AlertDialogDescription>
						This action cannot be undone. This will permanently delete the service provider from the
						database.
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
	);
};
