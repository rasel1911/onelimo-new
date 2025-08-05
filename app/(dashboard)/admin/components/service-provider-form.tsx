"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown, ChevronUp, HelpCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import AdminForm from "@/app/(dashboard)/admin/components/admin-form";
import {
	createServiceProviderAction,
	updateServiceProviderAction,
} from "@/app/(dashboard)/admin/service-providers/actions";
import {
	ServiceProviderFormSchema,
	REPUTATION_OPTIONS,
	RESPONSE_TIME_OPTIONS,
	ROLES,
	type ServiceProviderFormData,
} from "@/app/(dashboard)/admin/service-providers/validations";
import { AreaCoverageInput } from "@/components/custom/area-coverage-input";
import {
	MultiSelectLocationSuggestions,
	type LocationWithCoords,
} from "@/components/custom/multi-select-location-suggestions";
import { ServiceTypeSelector } from "@/components/custom/service-type-selector";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

type FormValues = ServiceProviderFormData;

const defaultValues = {
	name: "",
	email: "",
	phone: "",
	status: "active" as const,
	role: "partner" as const,
	serviceLocations: [] as string[],
	areaCovered: [] as string[],
	serviceType: [] as string[],
	reputation: 0,
	responseTime: 0,
};

type ServiceProviderFormProps = {
	mode: "create" | "edit";
	id?: string;
	initialData?: {
		name: string;
		email: string;
		phone: string;
		status: "active" | "inactive" | "pending" | boolean;
		role?: (typeof ROLES)[number];
		serviceLocations?: string[];
		areaCovered: string[];
		serviceType?: string[];
		reputation?: number;
		responseTime?: number;
	};
};

export const ServiceProviderForm = ({
	mode,
	id,
	initialData = defaultValues,
}: ServiceProviderFormProps) => {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [areaCovered, setAreaCovered] = useState<string[]>(initialData.areaCovered || []);
	const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
	const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
	const [selectedLocationCoords, setSelectedLocationCoords] = useState<LocationWithCoords[]>([]);
	const router = useRouter();

	const isPendingProvider =
		mode === "edit" &&
		((typeof initialData.status === "string" && initialData.status === "pending") ||
			(typeof initialData.status === "boolean" && !initialData.status));

	const form = useForm<FormValues>({
		resolver: zodResolver(ServiceProviderFormSchema),
		mode: "onChange",
		defaultValues: {
			name: initialData.name,
			email: initialData.email,
			phone: initialData.phone,
			status: typeof initialData.status === "string" ? initialData.status : "active",
			role: initialData.role || "partner",
			serviceLocations: initialData.serviceLocations || [],
			serviceType: initialData.serviceType || [],
			reputation: initialData.reputation || 0,
			responseTime: initialData.responseTime || 0,
		},
	});

	const { formState } = form;
	const { isValid } = formState;

	const formTitle = mode === "create" ? "New Service Provider" : "Edit Service Provider";
	const submitLabel = mode === "create" ? "Create Service Provider" : "Update Service Provider";
	const submittingLabel = mode === "create" ? "Creating..." : "Updating...";

	const onSubmit = async (values: FormValues) => {
		try {
			setIsSubmitting(true);

			const formData = new FormData();
			Object.entries(values).forEach(([key, value]) => {
				if (value !== undefined && key !== "serviceType" && key !== "serviceLocations") {
					formData.append(key, String(value));
				}
			});

			if (values.serviceLocations && values.serviceLocations.length > 0) {
				values.serviceLocations.forEach((location) => {
					formData.append("serviceLocations", location);
				});
			}

			if (areaCovered.length === 0) {
				formData.append("areaCovered", "all");
			} else {
				areaCovered.forEach((area) => {
					formData.append("areaCovered", area);
				});
			}

			values.serviceType.forEach((type) => {
				formData.append("serviceType", type);
			});

			const result =
				mode === "create"
					? await createServiceProviderAction(formData)
					: await updateServiceProviderAction(id!, formData);

			if (!result || result.success === false) {
				const errorMessages = result?.errors
					? Object.values(result.errors).flat()
					: ["An unknown error occurred"];
				toast.error(errorMessages[0] as string);
				return;
			}

			toast.success(`Service provider ${mode === "create" ? "created" : "updated"} successfully`);

			if (mode === "create") {
				toast.info(
					"Provider created. They will need to set up their PIN when first accessing booking requests.",
				);
			}

			router.push("/admin/service-providers?refresh=true");
			router.refresh();
		} catch (error) {
			console.error("Form submission error:", error);
			toast.error(`Failed to ${mode === "create" ? "create" : "update"} service provider`);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<>
			<AdminForm<FormValues>
				title={formTitle}
				form={form}
				onSubmit={onSubmit}
				isSubmitting={isSubmitting}
				backUrl="/admin/service-providers"
				submitLabel={submitLabel}
				submittingLabel={submittingLabel}
				disabled={!isValid}
			>
				{/* Status Toggle - Top Right */}
				<div className="mb-6 flex items-center justify-end space-x-4">
					<FormField
						control={form.control}
						name="status"
						render={({ field }) => (
							<FormItem className="flex items-center space-x-3">
								<div className="flex flex-col items-end space-y-1">
									<FormLabel className="text-sm font-medium">
										{field.value ? "Active" : isPendingProvider ? "Pending" : "Inactive"}
									</FormLabel>
									<FormDescription className="text-xs text-muted-foreground">
										Provider status
									</FormDescription>
								</div>
								<FormControl>
									<Switch
										checked={field.value === "active"}
										onCheckedChange={(checked) => field.onChange(checked ? "active" : "inactive")}
										className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-300"
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>

				<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
					<FormField
						control={form.control}
						name="name"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Company Name</FormLabel>
								<FormControl>
									<Input className="py-5" placeholder="Enter company name" {...field} />
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
								<FormLabel>Email</FormLabel>
								<FormControl>
									<Input
										className="py-5"
										placeholder="Enter email address"
										type="email"
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="phone"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Phone</FormLabel>
								<FormControl>
									<Input className="py-5" placeholder="Enter phone number" {...field} />
								</FormControl>
								<FormMessage />
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
										isEditMode={mode === "edit"}
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

					{/* Service Types - Main Form Section */}
					<div className="col-span-2">
						<FormField
							control={form.control}
							name="serviceType"
							render={({ field, fieldState }) => (
								<FormItem>
									<ServiceTypeSelector
										value={field.value}
										onChange={field.onChange}
										error={fieldState.error?.message}
										showDescription={false}
										className="rounded-md border p-3"
									/>
									<FormDescription>Select all vehicle types</FormDescription>
								</FormItem>
							)}
						/>
					</div>

					{/* Advanced Details Collapsible Section */}
					<div className="col-span-2 mt-4">
						<Collapsible
							open={isAdvancedOpen}
							onOpenChange={setIsAdvancedOpen}
							className="space-y-2"
						>
							<div className="flex items-center justify-between">
								<h3 className="text-lg font-medium">Advanced Details</h3>
								<CollapsibleTrigger asChild>
									<Button variant="ghost" size="sm" className="w-9 p-0">
										{isAdvancedOpen ? (
											<ChevronUp className="size-4" />
										) : (
											<ChevronDown className="size-4" />
										)}
										<span className="sr-only">Toggle advanced details</span>
									</Button>
								</CollapsibleTrigger>
							</div>

							<CollapsibleContent className="space-y-4">
								{/* 3-Column Grid for Role, Reputation, Response Time */}
								<div className="grid grid-cols-1 gap-6 md:grid-cols-3">
									<FormField
										control={form.control}
										name="role"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Role</FormLabel>
												<Select onValueChange={field.onChange} disabled={true} value={field.value}>
													<FormControl>
														<SelectTrigger>
															<SelectValue placeholder="Select role" />
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														<SelectItem value="partner">Partner</SelectItem>
													</SelectContent>
												</Select>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="reputation"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Reputation</FormLabel>
												<Select
													onValueChange={(value) => field.onChange(parseInt(value))}
													value={field.value.toString()}
													disabled={true}
												>
													<FormControl>
														<SelectTrigger>
															<SelectValue placeholder="Select reputation" />
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														{REPUTATION_OPTIONS.map((option) => (
															<SelectItem key={option.value} value={option.value.toString()}>
																{option.label}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="responseTime"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Response Time</FormLabel>
												<Select
													onValueChange={(value) => field.onChange(parseInt(value))}
													value={field.value.toString()}
													disabled={true}
												>
													<FormControl>
														<SelectTrigger>
															<SelectValue placeholder="Select response time" />
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														{RESPONSE_TIME_OPTIONS.map((option) => (
															<SelectItem key={option.value} value={option.value.toString()}>
																{option.label}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>

								<div className="col-span-2">
									<AreaCoverageInput
										value={areaCovered}
										onChange={setAreaCovered}
										placeholder="Add area covered (e.g., zipcode)"
										description={
											selectedLocationCoords.length > 0
												? `If left blank, all postcodes for ${selectedLocationCoords.map((loc) => loc.city).join(", ")} will be considered`
												: "Enter the postcodes where you provide service"
										}
									/>
								</div>
							</CollapsibleContent>
						</Collapsible>
					</div>
				</div>
			</AdminForm>

			{/* Fixed Help Button - Bottom Right */}
			<div className="fixed bottom-6 right-6 z-50">
				<Dialog open={isHelpModalOpen} onOpenChange={setIsHelpModalOpen}>
					<DialogTrigger asChild>
						<Button
							size="icon"
							variant="default"
							className="size-12 rounded-full shadow-lg transition-shadow hover:shadow-xl"
						>
							<HelpCircle className="size-6" />
						</Button>
					</DialogTrigger>
					<DialogContent className="max-w-2xl">
						<DialogHeader>
							<DialogTitle className="flex items-center gap-2">
								<HelpCircle className="size-5 text-primary" />
								Service Provider Form Guide
							</DialogTitle>
							<DialogDescription>
								Complete guide for creating and managing service provider profiles
							</DialogDescription>
						</DialogHeader>
						<div className="max-h-96 overflow-y-auto">
							<div className="space-y-4">
								<div className="rounded-lg border bg-card p-4">
									<h4 className="mb-2 font-medium text-card-foreground">Basic Information</h4>
									<ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
										<li>Provider name should be the full legal name of the service provider</li>
										<li>
											Email must be a valid business email address and will be used for account
											access
										</li>
										<li>Phone number must be in a valid UK (+44) or EU format</li>
									</ul>
								</div>

								<div className="rounded-lg border bg-card p-4">
									<h4 className="mb-2 font-medium text-card-foreground">Service Configuration</h4>
									<ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
										<li>Service locations indicate which cities/regions the provider covers</li>
										<li>Service types indicate what transportation services the provider offers</li>
										<li>Select all vehicle types of the service provided</li>
									</ul>
								</div>

								<div className="rounded-lg border bg-card p-4">
									<h4 className="mb-2 font-medium text-card-foreground">Coverage Areas</h4>
									<ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
										<li>Area covered should list zipcodes/postcodes the provider services</li>
										<li>
											If no specific areas are listed, all areas in the selected locations will be
											covered
										</li>
									</ul>
								</div>

								<div className="rounded-lg border bg-card p-4">
									<h4 className="mb-2 font-medium text-card-foreground">
										Provider Status & Settings
									</h4>
									<ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
										<li>Toggle the status switch to activate or deactivate the service provider</li>
										<li>
											Pending providers can be approved using the &quot;Approve Provider&quot;
											button
										</li>
										<li>
											Reputation and response time scores are used for service provider rankings
										</li>
										<li>Role is automatically set to &quot;Partner&quot; for service providers</li>
									</ul>
								</div>

								<div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
									<h4 className="mb-2 font-medium text-destructive">Important Notes</h4>
									<ul className="list-disc space-y-1 pl-5 text-sm text-destructive/80">
										<li>All fields marked with * are required</li>
										<li>At least one service type must be selected</li>
										<li>At least one service location must be selected</li>
										<li>
											Changes are saved when you click &quot;Create&quot; or &quot;Update&quot;
											button
										</li>
									</ul>
								</div>
							</div>
						</div>
					</DialogContent>
				</Dialog>
			</div>
		</>
	);
};
