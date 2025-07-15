"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Copy, Link, Mail } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { invitePartner } from "@/app/(partners)/actions/invite-partner";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const inviteSchema = z.object({
	email: z.string().email("Invalid email address").min(1, "Email is required"),
});

type FormValues = z.infer<typeof inviteSchema>;

interface InviteModalProps {
	trigger?: React.ReactNode;
	onSuccess?: () => void;
}

export const InviteModal = ({ trigger, onSuccess }: InviteModalProps) => {
	const [open, setOpen] = useState(false);
	const [activeTab, setActiveTab] = useState<string>("url");
	const [isGenerating, setIsGenerating] = useState(false);
	const [isSending, setIsSending] = useState(false);
	const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
	const [copied, setCopied] = useState(false);
	const urlInputRef = useRef<HTMLInputElement>(null);

	const form = useForm<FormValues>({
		resolver: zodResolver(inviteSchema),
		defaultValues: {
			email: "",
		},
	});

	useEffect(() => {
		if (copied) {
			const timeout = setTimeout(() => {
				setCopied(false);
			}, 2000);
			return () => clearTimeout(timeout);
		}
	}, [copied]);

	useEffect(() => {
		if (generatedUrl && urlInputRef.current && activeTab === "url") {
			urlInputRef.current.select();
			try {
				navigator.clipboard.writeText(generatedUrl);
				setCopied(true);
				toast.success("URL copied to clipboard!");
			} catch (err) {
				console.error("Failed to copy:", err);
			}
		}
	}, [generatedUrl, activeTab]);

	async function onGenerateUrl(values: FormValues) {
		try {
			setIsGenerating(true);

			const result = await invitePartner(values, false);

			if (result.success && result.registrationUrl) {
				setGeneratedUrl(result.registrationUrl);
				toast.success("Invitation URL generated successfully!");
			} else {
				const errorMessage =
					typeof result.error === "string" ? result.error : "Failed to generate invitation URL";
				toast.error(errorMessage);
			}
		} catch (error) {
			console.error("Error generating URL:", error);
			toast.error("An unexpected error occurred.");
		} finally {
			setIsGenerating(false);
		}
	}

	async function onSendInvite(values: FormValues) {
		try {
			setIsSending(true);

			const result = await invitePartner(values, true);

			if (result.success) {
				form.reset();
				toast.success("Invitation sent successfully!");
				if (onSuccess) {
					onSuccess();
				}
				setOpen(false);
			} else {
				const errorMessage =
					typeof result.error === "string" ? result.error : "Failed to send invitation";
				toast.error(errorMessage);
			}
		} catch (error) {
			console.error("Invitation error:", error);
			toast.error("An unexpected error occurred.");
		} finally {
			setIsSending(false);
		}
	}

	const handleCopy = () => {
		if (generatedUrl) {
			navigator.clipboard.writeText(generatedUrl);
			setCopied(true);
			toast.success("URL copied to clipboard!");
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				{trigger || (
					<Button variant="outline">
						<Mail className="mr-2 size-4" />
						Invite Partner
					</Button>
				)}
			</DialogTrigger>
			<DialogContent className="sm:max-w-xl">
				<DialogHeader>
					<DialogTitle>Invite Partner</DialogTitle>
					<DialogDescription>
						Generate an invitation URL or send an email invitation to a new partner
					</DialogDescription>
				</DialogHeader>

				<Tabs defaultValue="url" value={activeTab} onValueChange={setActiveTab} className="w-full">
					<TabsList className="grid w-full grid-cols-2">
						<TabsTrigger value="url" className="flex items-center">
							<Link className="mr-2 size-4" />
							Generate URL
						</TabsTrigger>
						<TabsTrigger value="email" className="flex items-center">
							<Mail className="mr-2 size-4" />
							Send Email
						</TabsTrigger>
					</TabsList>

					<TabsContent value="url" className="mt-4 space-y-4">
						<Form {...form}>
							<form onSubmit={form.handleSubmit(onGenerateUrl)} className="space-y-4">
								<FormField
									control={form.control}
									name="email"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Email Address</FormLabel>
											<FormControl>
												<Input placeholder="partner@example.com" {...field} />
											</FormControl>
											<FormDescription>
												This email will be associated with the invitation URL.
											</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>
								<Button type="submit" disabled={isGenerating} className="w-full">
									{isGenerating ? "Generating..." : "Generate URL"}
								</Button>
							</form>
						</Form>

						{generatedUrl && (
							<div className="rounded-md border bg-muted/30 p-3">
								<p className="mb-2 text-sm font-medium">Invitation URL:</p>
								<div className="relative flex items-center">
									<Input
										ref={urlInputRef}
										readOnly
										value={generatedUrl}
										className="pr-12 font-mono text-xs"
									/>
									<Button
										size="sm"
										variant="ghost"
										className="absolute right-0 h-full px-3"
										onClick={handleCopy}
									>
										{copied ? (
											<Check className="size-4 text-green-500" />
										) : (
											<Copy className="size-4" />
										)}
									</Button>
								</div>
								<p className="mt-2 text-xs text-muted-foreground">
									This URL is valid for 48 hours. Once used, it cannot be used again.
								</p>
							</div>
						)}
					</TabsContent>

					<TabsContent value="email" className="mt-4">
						<Form {...form}>
							<form onSubmit={form.handleSubmit(onSendInvite)} className="space-y-4">
								<FormField
									control={form.control}
									name="email"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Email Address</FormLabel>
											<FormControl>
												<Input placeholder="partner@example.com" {...field} />
											</FormControl>
											<FormDescription>
												An invitation will be sent to this email address.
											</FormDescription>
											<FormMessage />
										</FormItem>
									)}
								/>
								<Button type="submit" disabled={isSending} className="w-full">
									{isSending ? "Sending..." : "Send Invitation"}
								</Button>
							</form>
						</Form>
					</TabsContent>
				</Tabs>
			</DialogContent>
		</Dialog>
	);
};
