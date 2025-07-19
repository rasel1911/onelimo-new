"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import {
	updatePersistentRegistrationLink,
	UpdatePersistentLinkData,
} from "@/app/(partners)/actions/persistent-link-actions";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PersistentRegistrationLink } from "@/db/schema";

const editLinkSchema = z.object({
	title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
	description: z.string().optional(),
});

type FormValues = z.infer<typeof editLinkSchema>;

interface EditPersistentLinkModalProps {
	link: PersistentRegistrationLink;
	trigger?: React.ReactNode;
	onSuccess?: () => void;
}

export const EditPersistentLinkModal = ({
	link,
	trigger,
	onSuccess,
}: EditPersistentLinkModalProps) => {
	const [open, setOpen] = useState(false);
	const [isUpdating, setIsUpdating] = useState(false);

	const form = useForm<FormValues>({
		resolver: zodResolver(editLinkSchema),
		defaultValues: {
			title: link.title,
			description: link.description || "",
		},
	});

	useEffect(() => {
		if (open) {
			form.reset({
				title: link.title,
				description: link.description || "",
			});
		}
	}, [open, link, form]);

	const onSubmit = async (values: FormValues) => {
		try {
			setIsUpdating(true);

			const updateData: UpdatePersistentLinkData = {
				id: link.id,
				title: values.title,
				description: values.description,
			};

			const result = await updatePersistentRegistrationLink(updateData);

			if (result.success && result.link) {
				toast.success("Persistent link updated successfully!");
				setOpen(false);

				if (onSuccess) {
					onSuccess();
				}
			} else {
				const errorMessage =
					typeof result.error === "string" ? result.error : "Failed to update persistent link";
				toast.error(errorMessage);
			}
		} catch (error) {
			console.error("Error updating persistent link:", error);
			toast.error("An unexpected error occurred.");
		} finally {
			setIsUpdating(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>{trigger || <Button variant="outline">Edit</Button>}</DialogTrigger>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Edit Persistent Link</DialogTitle>
					<DialogDescription>
						Update the title and description for this persistent registration link.
					</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="title"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Title</FormLabel>
									<FormControl>
										<Input placeholder="e.g., WhatsApp Registration Link" {...field} />
									</FormControl>
									<FormDescription>
										A descriptive title to help you identify this link in the admin panel.
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="description"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Description (Optional)</FormLabel>
									<FormControl>
										<Textarea
											placeholder="e.g., Link shared via WhatsApp for social media outreach"
											className="min-h-[80px]"
											{...field}
										/>
									</FormControl>
									<FormDescription>
										Additional details about where and how this link will be used.
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="flex justify-end space-x-2 pt-4">
							<Button
								type="button"
								variant="outline"
								onClick={() => setOpen(false)}
								disabled={isUpdating}
							>
								Cancel
							</Button>
							<Button type="submit" disabled={isUpdating}>
								{isUpdating ? "Updating..." : "Update Link"}
							</Button>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
};
