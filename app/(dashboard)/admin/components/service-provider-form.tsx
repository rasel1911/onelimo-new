"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown, ChevronUp, Plus, X, HelpCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import AdminForm from "@/app/(dashboard)/admin/components/admin-form";
import { LocationModal } from "@/app/(dashboard)/admin/components/location-modal";
import { createLocation } from "@/app/(dashboard)/admin/locations/actions";
import {
	createServiceProviderAction,
	updateServiceProviderAction,
} from "@/app/(dashboard)/admin/service-providers/actions";
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
import { MultiSelectLocations } from "@/components/ui/multi-select-locations";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useLocations } from "@/hooks/use-locations";

const SERVICE_TYPES = [
	"suv",
	"party_bus",
	"stretch_limousine",
	"sedan",
	"hummer",
	"other",
] as const;

const ROLES = ["user", "customer", "admin", "support", "partner"] as const;

const formSchema = z.object({
	name: z.string().min(1, "Name is required"),
	email: z
		.string()
		.email("Invalid email address")
		.refine((email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email), {
			message: "Please enter a valid email address",
		}),
	phone: z
		.string()
		.min(1, "Phone number is required")
		.refine(
			(phone) => {
				const euRegex = /^(\+[1-9]{1}[0-9]{1,2}|00[1-9]{1}[0-9]{1,2})[0-9]{6,12}$/;
				const ukRegex = /^(\+44|0)7\d{9}$/;

				return euRegex.test(phone.replace(/\s+/g, "")) || ukRegex.test(phone.replace(/\s+/g, ""));
			},
			{ message: "Please enter a valid EU or UK phone number" },
		),
	status: z.boolean(),
	role: z.enum(ROLES),
	serviceType: z.array(z.enum(SERVICE_TYPES)).min(1, "At least one service type is required"),
	reputation: z.number().min(0).max(5),
	responseTime: z.number().min(0).max(5),
	locationIds: z.array(z.string()).min(1, "At least one service location is required"),
});

type FormValues = z.infer<typeof formSchema>;

const defaultValues = {
	name: "",
	email: "",
	phone: "",
	status: true,
	role: "partner" as const,
	locationIds: [] as string[],
	areaCovered: [] as string[],
	serviceType: ["stretch_limousine"] as (typeof SERVICE_TYPES)[number][],
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
		locationIds?: string[];
		areaCovered: string[];
		serviceType?: (typeof SERVICE_TYPES)[number][];
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
	const [selectedServiceTypes, setSelectedServiceTypes] = useState<string[]>(
		initialData.serviceType?.map((type) => type.toString()) || ["stretch_limousine"],
	);
	const [newArea, setNewArea] = useState("");
	const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
	const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
	const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
	const router = useRouter();

	// Check if the provider is pending and form is in edit mode
	const isPendingProvider =
		mode === "edit" &&
		((typeof initialData.status === "string" && initialData.status === "pending") ||
			(typeof initialData.status === "boolean" && !initialData.status));

	const { getLocationsByIds } = useLocations({ showToast: false });

	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema) as never,
		defaultValues: {
			name: initialData.name,
			email: initialData.email,
			phone: initialData.phone,
			status:
				typeof initialData.status === "boolean"
					? initialData.status
					: initialData.status === "active",
			role: initialData.role || "partner",
			locationIds: initialData.locationIds || [],
			serviceType: initialData.serviceType || ["stretch_limousine"],
			reputation: initialData.reputation || 0,
			responseTime: initialData.responseTime || 0,
		},
	});

	const formTitle = mode === "create" ? "New Service Provider" : "Edit Service Provider";
	const submitLabel = mode === "create" ? "Create Service Provider" : "Update Service Provider";
	const submittingLabel = mode === "create" ? "Creating..." : "Updating...";

	const handleAddArea = () => {
		if (newArea.trim() && !areaCovered.includes(newArea.trim())) {
			setAreaCovered([...areaCovered, newArea.trim()]);
			setNewArea("");
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (["Enter", "Tab", ","].includes(e.key)) {
			e.preventDefault();
			handleAddArea();
		}
	};

	const handleRemoveArea = (index: number) => {
		setAreaCovered(areaCovered.filter((_, i) => i !== index));
	};

	const handleLocationAdded = (locationId: string) => {
		form.setValue("locationIds", [...form.getValues("locationIds"), locationId]);
	};

	const handleToggleServiceType = (type: string) => {
		if (selectedServiceTypes.includes(type)) {
			if (selectedServiceTypes.length > 1) {
				setSelectedServiceTypes(selectedServiceTypes.filter((t) => t !== type));
			}
		} else {
			setSelectedServiceTypes([...selectedServiceTypes, type]);
		}
	};

	const handleApproveProvider = () => {
		form.setValue("status", true);
		toast.success("Provider status set to active");
	};

	async function onSubmit(values: FormValues) {
		try {
			setIsSubmitting(true);

			const formData = new FormData();
			Object.entries(values).forEach(([key, value]) => {
				if (value !== undefined && key !== "serviceType" && key !== "locationIds") {
					if (key === "status") {
						formData.append(key, (value as boolean) ? "active" : "inactive");
					} else {
						formData.append(key, String(value));
					}
				}
			});

			if (values.locationIds.length > 0) {
				formData.append("locationId", values.locationIds[0]);
				values.locationIds.forEach((locationId) => {
					formData.append("locationIds", locationId);
				});
			}

			if (areaCovered.length === 0) {
				formData.append("areaCovered", "all");
			} else {
				areaCovered.forEach((area) => {
					formData.append("areaCovered", area);
				});
			}

			selectedServiceTypes.forEach((type) => {
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
				toast.error(errorMessages[0]);
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
	}

	const selectedLocations = getLocationsByIds(form.watch("locationIds"));

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
										checked={field.value}
										onCheckedChange={field.onChange}
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
						name="locationIds"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Service Locations *</FormLabel>
								<FormControl>
									<MultiSelectLocations
										value={field.value}
										onChange={field.onChange}
										placeholder="Select locations..."
										required
										createLocationText="Need to add a new location?"
										addLocationButtonText="Add new location"
										onCreateLocation={async (cityName) => {
											const formData = new FormData();
											formData.append("city", cityName);
											formData.append("zipcodes", "all");

											const result = await createLocation(formData);
											if (result.success && result.location) {
												return { success: true, location: result.location };
											}
											return { success: false };
										}}
									/>
								</FormControl>
								<FormMessage />
								<FormDescription>
									{selectedLocations.length > 0
										? `Selected: ${selectedLocations.map((l) => l.city).join(", ")}`
										: "Select all cities/regions where service is provided"}
								</FormDescription>
							</FormItem>
						)}
					/>

					{/* Service Types - Main Form Section */}
					<div className="col-span-2">
						<FormItem>
							<FormLabel>Service Types *</FormLabel>
							<div className="flex flex-wrap gap-2 rounded-md border p-3">
								{SERVICE_TYPES.map((type) => (
									<Button
										key={type}
										type="button"
										variant={selectedServiceTypes.includes(type) ? "default" : "outline"}
										onClick={() => handleToggleServiceType(type)}
										className="mb-1 capitalize"
									>
										{type.replace(/_/g, " ")}
									</Button>
								))}
							</div>
							{selectedServiceTypes.length === 0 && (
								<p className="mt-1 text-sm text-red-500">At least one service type is required</p>
							)}
							<FormDescription>Select all vehicle types that your service provides</FormDescription>
						</FormItem>
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
														<SelectItem value="0">Default (0)</SelectItem>
														<SelectItem value="1">Good (1)</SelectItem>
														<SelectItem value="2">Very Good (2)</SelectItem>
														<SelectItem value="3">Excellent (3)</SelectItem>
														<SelectItem value="4">Outstanding (4)</SelectItem>
														<SelectItem value="5">Exceptional (5)</SelectItem>
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
														<SelectItem value="0">Default (0)</SelectItem>
														<SelectItem value="1">Fast (1)</SelectItem>
														<SelectItem value="2">Very Fast (2)</SelectItem>
														<SelectItem value="3">Excellent (3)</SelectItem>
														<SelectItem value="4">Outstanding (4)</SelectItem>
														<SelectItem value="5">Exceptional (5)</SelectItem>
													</SelectContent>
												</Select>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>

								<div className="col-span-2">
									<FormLabel>Area Covered</FormLabel>
									<div className="mb-2 flex">
										<Input
											type="text"
											placeholder="Add area covered (e.g., zipcode)"
											value={newArea}
											onChange={(e) => setNewArea(e.target.value)}
											onKeyDown={handleKeyDown}
											className="mr-2 flex-1"
										/>
										<Button type="button" variant="outline" onClick={handleAddArea}>
											<Plus className="size-4" />
										</Button>
									</div>

									<div className="mt-2 flex flex-wrap gap-2">
										{areaCovered.map((area, index) => (
											<div
												key={index}
												className="flex items-center rounded-md border bg-background px-3 py-1 text-sm text-primary"
											>
												{area}
												<Button
													type="button"
													variant="ghost"
													size="sm"
													className="ml-1 size-4 p-0"
													onClick={() => handleRemoveArea(index)}
												>
													<X className="size-3" />
												</Button>
											</div>
										))}
										{areaCovered.length === 0 && (
											<p className="text-sm text-muted-foreground">
												No areas added. If none specified, all areas in the location will be
												covered.
											</p>
										)}
									</div>
								</div>
							</CollapsibleContent>
						</Collapsible>
					</div>
				</div>
			</AdminForm>

			<LocationModal
				open={isLocationModalOpen}
				onOpenChange={setIsLocationModalOpen}
				onLocationAdded={handleLocationAdded}
			/>

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
										<li>Select all vehicle types that your service provides</li>
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
