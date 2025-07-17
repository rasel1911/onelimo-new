import { zodResolver } from "@hookform/resolvers/zod";
import { X, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { createLocation } from "@/app/(dashboard)/admin/locations/actions";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const locationSchema = z.object({
	city: z.string().min(1, "City is required"),
	zipcodes: z.string().optional(),
});

type LocationFormValues = z.infer<typeof locationSchema>;

interface LocationModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onLocationAdded: (locationId: string, cityName: string) => void;
}

export const LocationModal = ({ open, onOpenChange, onLocationAdded }: LocationModalProps) => {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [zipCodes, setZipCodes] = useState<string[]>([]);
	const [currentZipCode, setCurrentZipCode] = useState("");
	const [zipCodeError, setZipCodeError] = useState<string | null>(null);

	const form = useForm<LocationFormValues>({
		resolver: zodResolver(locationSchema),
		defaultValues: {
			city: "",
			zipcodes: "",
		},
	});

	useEffect(() => {
		if (!open) {
			form.reset();
			setZipCodes([]);
			setCurrentZipCode("");
			setZipCodeError(null);
		}
	}, [open, form]);

	const addZipCode = () => {
		if (currentZipCode.trim() && !zipCodes.includes(currentZipCode.trim())) {
			setZipCodes([...zipCodes, currentZipCode.trim()]);
			setCurrentZipCode("");
			setZipCodeError(null);
		}
	};

	const removeZipCode = (index: number) => {
		const newZipCodes = zipCodes.filter((_, i) => i !== index);
		setZipCodes(newZipCodes);

		if (newZipCodes.length === 0) {
			setZipCodeError("At least one zipcode is required");
		}
	};

	const onSubmit = async (values: LocationFormValues) => {
		try {
			if (zipCodes.length === 0) {
				setZipCodeError("At least one zipcode is required");
				return;
			}

			setIsSubmitting(true);

			const formData = new FormData();
			formData.append("city", values.city);

			zipCodes.forEach((zipcode) => {
				formData.append("zipcodes", zipcode);
			});

			const result = await createLocation(formData);

			if (result.success && result.location) {
				toast.success("Location added successfully");
				onLocationAdded(result.location.id, result.location.city);
				form.reset();
				setZipCodes([]);
				setZipCodeError(null);
				onOpenChange(false);
			} else {
				let errorMessage = "Failed to add location";
				if (result.error) {
					if (typeof result.error === "string") {
						errorMessage = result.error;
					} else if (typeof result.error === "object") {
						const errorObj = result.error as Record<string, string[]>;
						const firstErrorKey = Object.keys(errorObj)[0];
						if (firstErrorKey && errorObj[firstErrorKey]?.length) {
							errorMessage = errorObj[firstErrorKey][0];
						}
					}
				}
				toast.error(errorMessage);
			}
		} catch (error) {
			console.error("Error adding location:", error);
			toast.error("An error occurred while adding the location");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Add New Location</DialogTitle>
					<DialogDescription>Enter the details for a new service location.</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
						<FormField
							control={form.control}
							name="city"
							render={({ field }) => (
								<FormItem>
									<FormLabel>City</FormLabel>
									<FormControl>
										<Input placeholder="Enter city name" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormItem>
							<FormLabel>Zip Codes</FormLabel>
							<div className="flex gap-2">
								<FormControl>
									<Input
										placeholder="Add zipcode"
										value={currentZipCode}
										onChange={(e) => setCurrentZipCode(e.target.value)}
										onKeyDown={(e) => {
											if (e.key === "Enter") {
												e.preventDefault();
												addZipCode();
											}
										}}
									/>
								</FormControl>
								<Button type="button" onClick={addZipCode} size="sm">
									<Plus className="size-4" />
								</Button>
							</div>

							{/* Show zipcode error if present */}
							{zipCodeError && (
								<p className="mt-1 text-sm font-medium text-destructive">{zipCodeError}</p>
							)}

							{zipCodes.length > 0 && (
								<div className="mt-2 flex flex-wrap gap-2">
									{zipCodes.map((zipcode, index) => (
										<div
											key={index}
											className="flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5"
										>
											<span className="text-sm font-medium">{zipcode}</span>
											<button
												type="button"
												onClick={() => removeZipCode(index)}
												className="text-muted-foreground hover:text-foreground"
											>
												<X className="size-3.5" />
											</button>
										</div>
									))}
								</div>
							)}
						</FormItem>

						<DialogFooter>
							<Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
								Cancel
							</Button>
							<Button type="submit" disabled={isSubmitting}>
								{isSubmitting ? "Adding..." : "Add Location"}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
};
