"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown, ChevronUp, HelpCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import {
	registrationFormSchema,
	type RegistrationFormData,
} from "@/app/(dashboard)/admin/service-providers/validations";
import { registerPartner } from "@/app/(partners)/actions/partner-registration";
import { AreaCoverageInput } from "@/components/custom/area-coverage-input";
import {
	MultiSelectLocationSuggestions,
	type LocationWithCoords,
} from "@/components/custom/multi-select-location-suggestions";
import { ServiceTypeSelector } from "@/components/custom/service-type-selector";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
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
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type FormValues = RegistrationFormData;

interface PartnerRegistrationFormProps {
	initialEmail?: string;
	token?: string | null;
	persistentLinkId?: string | null;
}

export const PartnerRegistrationForm = ({
	initialEmail = "",
	token,
	persistentLinkId,
}: PartnerRegistrationFormProps) => {
	const [areaCovered, setAreaCovered] = useState<string[]>([]);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
	const [selectedLocationCoords, setSelectedLocationCoords] = useState<LocationWithCoords[]>([]);

	const router = useRouter();

	const form = useForm<FormValues>({
		resolver: zodResolver(registrationFormSchema),
		mode: "onChange",
		defaultValues: {
			name: "",
			email: initialEmail,
			phone: "",
			serviceLocations: [],
			serviceType: [],
			website: "",
		},
	});

	const isFormValid = () => {
		const errors = form.formState.errors;
		const values = form.getValues();

		return (
			Object.keys(errors).length === 0 &&
			values.name.trim() !== "" &&
			values.email.trim() !== "" &&
			values.phone.trim() !== "" &&
			values.serviceLocations.length > 0 &&
			values.serviceType.length > 0
		);
	};

	const onSubmit = async (values: FormValues) => {
		if (!isFormValid()) {
			toast.error("Please fill in all required fields correctly");
			return;
		}

		try {
			setIsSubmitting(true);

			const formData = {
				...values,
				areaCovered: areaCovered.length > 0 ? areaCovered : ["all"],
				serviceLocations: selectedLocationCoords.map((loc) => loc.city),
				token: token,
				persistentLinkId: persistentLinkId,
				status: "pending" as const,
				role: "partner" as const,
				reputation: 0,
				responseTime: 0,
			};

			const result = await registerPartner(formData);

			if (result.success) {
				toast.success("Registration submitted successfully!");
				router.push("/partner-registration/success");
			} else {
				const errorMessage =
					typeof result.error === "string" ? result.error : "Failed to submit registration";
				toast.error(errorMessage);
			}
		} catch (error) {
			console.error("Registration error:", error);
			toast.error("An unexpected error occurred. Please try again.");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="container mx-auto py-10">
			<div className="mx-auto max-w-5xl">
				<div className="mb-8 text-center">
					<h1 className="text-3xl font-bold tracking-tight">Partner Registration</h1>
					<p className="mt-2 text-muted-foreground">
						Join our network of transportation providers and grow your business
					</p>
				</div>

				<div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
					<div className="col-span-1 lg:col-span-2">
						<Form {...form}>
							<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
								<Card>
									<CardHeader>
										<CardTitle>Company Information</CardTitle>
										<CardDescription>Provide your business details to get started</CardDescription>
									</CardHeader>
									<CardContent className="space-y-6">
										<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
											<FormField
												control={form.control}
												name="name"
												render={({ field }) => (
													<FormItem>
														<FormLabel>Company Name *</FormLabel>
														<FormControl>
															<Input placeholder="Your company name" {...field} />
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>

											<FormField
												control={form.control}
												name="email"
												render={({ field }) => (
													<FormItem>
														<FormLabel>Email Address *</FormLabel>
														<FormControl>
															<Input type="email" placeholder="your@email.com" {...field} />
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>
										</div>

										<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
											<FormField
												control={form.control}
												name="phone"
												render={({ field }) => (
													<FormItem>
														<FormLabel>Phone Number *</FormLabel>
														<FormControl>
															<Input placeholder="+44 7123 456789" {...field} />
														</FormControl>
														<FormMessage />
														<FormDescription>Enter a valid UK or EU phone number</FormDescription>
													</FormItem>
												)}
											/>
											<FormField
												control={form.control}
												name="serviceLocations"
												render={({ field, fieldState }) => (
													<FormItem>
														<FormLabel>Service Locations *</FormLabel>
														<FormControl>
															<MultiSelectLocationSuggestions
																name="serviceLocations"
																control={form.control}
																placeholder="Add cities where you provide service..."
																onLocationChange={setSelectedLocationCoords}
															/>
														</FormControl>
														<FormMessage />
														{!fieldState.error && selectedLocationCoords.length === 0 && (
															<FormDescription>
																Select all cities/regions where you provide service
															</FormDescription>
														)}
													</FormItem>
												)}
											/>
										</div>

										<Separator />

										{/* Service Types */}
										<FormField
											control={form.control}
											name="serviceType"
											render={({ field, fieldState }) => (
												<FormItem>
													<ServiceTypeSelector
														value={field.value}
														onChange={field.onChange}
														error={fieldState.error?.message}
													/>
												</FormItem>
											)}
										/>

										<Separator />

										{/* Advanced Section - Collapsible */}
										<Collapsible
											open={isAdvancedOpen}
											onOpenChange={setIsAdvancedOpen}
											className="w-full space-y-4"
										>
											<div className="flex items-center justify-between">
												<h3 className="text-lg font-medium">Advanced Details</h3>
												<CollapsibleTrigger asChild>
													<Button variant="ghost" size="sm">
														{isAdvancedOpen ? (
															<>
																<ChevronUp className="mr-1 size-4" />
																Hide
															</>
														) : (
															<>
																<ChevronDown className="mr-1 size-4" />
																Show
															</>
														)}
													</Button>
												</CollapsibleTrigger>
											</div>

											<CollapsibleContent className="space-y-4">
												<AreaCoverageInput
													value={areaCovered}
													onChange={setAreaCovered}
													description={
														selectedLocationCoords.length > 0
															? `If left blank, all postcodes for ${selectedLocationCoords.map((loc) => loc.city).join(", ")} will be considered`
															: "Enter the postcodes where you provide service"
													}
												/>
											</CollapsibleContent>
										</Collapsible>
									</CardContent>
									<CardFooter className="flex justify-between border-t pt-6">
										<Button type="button" variant="outline" onClick={() => router.push("/")}>
											Cancel
										</Button>
										<Button
											type="submit"
											disabled={isSubmitting || !isFormValid()}
											size="lg"
											className="px-8"
										>
											{isSubmitting ? "Submitting..." : "Submit Application"}
										</Button>
									</CardFooter>
								</Card>
							</form>
						</Form>
					</div>

					{/* Help Box - Visible on large screens, tooltip on small */}
					<div className="hidden lg:block">
						<div className="sticky top-8 rounded-lg border bg-card p-6 shadow-sm">
							<div className="mb-4 flex items-center gap-2">
								<HelpCircle className="size-5 text-primary" />
								<h3 className="font-medium">Registration Guide</h3>
							</div>
							<div className="space-y-4 text-sm">
								<p>
									<strong>Company Information:</strong> Provide your company name and contact
									details as they appear on your business documents.
								</p>
								<p>
									<strong>Service Types:</strong> Select all transportation services your company
									offers to customers. You can add custom service types if needed.
								</p>
								<p>
									<strong>Service Areas:</strong> Add specific postcodes where you provide service,
									or leave blank to cover all areas in your selected city.
								</p>
								<p>
									<strong>Location:</strong> If your city is not listed, you can add it using the +
									button.
								</p>
								<p>
									Your application will be reviewed by our team and you&apos;ll receive an email
									when approved, typically within 1-2 business days.
								</p>
							</div>
						</div>
					</div>

					{/* Mobile Help Button */}
					<div className="fixed bottom-6 right-6 lg:hidden">
						<TooltipProvider>
							<Tooltip>
								<TooltipTrigger asChild>
									<Button size="icon" variant="secondary" className="rounded-full shadow-lg">
										<HelpCircle className="size-5" />
									</Button>
								</TooltipTrigger>
								<TooltipContent side="left" className="w-80 p-4">
									<div className="space-y-2">
										<h3 className="font-medium">Registration Guide</h3>
										<p className="text-sm">
											<strong>Company Information:</strong> Provide your company name and contact
											details.
										</p>
										<p className="text-sm">
											<strong>Service Types:</strong> Select all transportation services you offer.
											You can add custom types.
										</p>
										<p className="text-sm">
											<strong>Service Areas:</strong> Add specific postcodes or leave blank for all
											areas.
										</p>
										<p className="text-sm">
											<strong>Location:</strong> Add your city if not listed.
										</p>
										<p className="text-sm">
											Your application will be reviewed within 1-2 business days.
										</p>
									</div>
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>
					</div>
				</div>
			</div>
		</div>
	);
};
