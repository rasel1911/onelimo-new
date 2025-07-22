"use client";

import { useState } from "react";

import { deleteLocationAction } from "@/app/(dashboard)/admin/locations/actions";
import {
	AlertDialog,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

interface DeleteLocationProps {
	id: string;
	cityName: string;
	onLocationDeleted?: () => void;
}

export const DeleteLocation = ({ id, cityName, onLocationDeleted }: DeleteLocationProps) => {
	const [isOpen, setIsOpen] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleDelete = async () => {
		try {
			setIsDeleting(true);
			setError(null);

			const response = await deleteLocationAction(id);

			if (response?.success) {
				setIsOpen(false);
				onLocationDeleted?.();
			} else {
				setError(response.error as string);
				return;
			}
		} catch (e) {
			setError("An unexpected error occurred. Please try again.");
		} finally {
			setIsDeleting(false);
		}
	};

	return (
		<>
			<DropdownMenuItem
				onSelect={(e) => {
					e.preventDefault();
					setIsOpen(true);
				}}
				className="text-red-600"
			>
				Delete
			</DropdownMenuItem>

			<AlertDialog open={isOpen} onOpenChange={setIsOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete Location</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to delete the location &quot;{cityName}&quot;? This action
							cannot be undone and may affect service providers using this location.
						</AlertDialogDescription>
					</AlertDialogHeader>

					{error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">{error}</div>}

					<AlertDialogFooter>
						<AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
						<Button
							variant="destructive"
							onClick={handleDelete}
							disabled={isDeleting}
							className="flex items-center gap-2"
						>
							{isDeleting ? "Deleting..." : "Delete"}
						</Button>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
};
