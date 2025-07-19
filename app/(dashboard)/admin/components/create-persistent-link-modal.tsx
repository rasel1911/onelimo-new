"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { createPersistentRegistrationLink } from "@/app/(partners)/actions/persistent-link-actions";
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

const createLinkSchema = z.object({
	title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
	description: z.string().optional(),
});

type FormValues = z.infer<typeof createLinkSchema>;

interface CreatePersistentLinkModalProps {
	trigger?: React.ReactNode;
	onSuccess?: () => void;
}

export const CreatePersistentLinkModal = ({
	trigger,
	onSuccess,
}: CreatePersistentLinkModalProps) => {
	const [open, setOpen] = useState(false);
	const [isCreating, setIsCreating] = useState(false);

	const form = useForm<FormValues>({
		resolver: zodResolver(createLinkSchema),
		defaultValues: {
			title: "",
			description: "",
		},
	});

	async function onSubmit(values: FormValues) {
		try {
			setIsCreating(true);

			const result = await createPersistentRegistrationLink(values);

			if (result.success && result.link) {
				form.reset();
				toast.success("Persistent link created successfully!");
				setOpen(false);

				if (onSuccess) {
					onSuccess();
				}
			} else {
				const errorMessage =
					typeof result.error === "string" ? result.error : "Failed to create persistent link";
				toast.error(errorMessage);
			}
		} catch (error) {
			console.error("Error creating persistent link:", error);
			toast.error("An unexpected error occurred.");
		} finally {
			setIsCreating(false);
		}
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>{trigger || <Button>Create Persistent Link</Button>}</DialogTrigger>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Create Persistent Link</DialogTitle>
					<DialogDescription>
						Create a permanent registration link that never expires and can be shared across
						multiple channels.
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
										<Input placeholder="e.g., Partner Registration Link" {...field} />
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
								disabled={isCreating}
							>
								Cancel
							</Button>
							<Button type="submit" disabled={isCreating}>
								{isCreating ? "Creating..." : "Create Link"}
							</Button>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
};
