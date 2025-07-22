"use client";

import { PlusCircle, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { KeyboardEvent, useEffect, useState } from "react";

import {
	UK_POSTCODE_REGEX,
	EU_POSTCODE_REGEX,
} from "@/app/(booking)/booking-request-form/validation/booking-form-schemas";
import { createLocation, updateLocationAction } from "@/app/(dashboard)/admin/locations/actions";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface LocationFormProps {
	initialData?: {
		id: string;
		city: string;
		zipcodes: string[];
	};
	mode: "create" | "edit";
}

export const LocationForm = ({ initialData, mode }: LocationFormProps) => {
	const router = useRouter();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [city, setCity] = useState(initialData?.city || "");
	const [zipcodes, setZipcodes] = useState<string[]>(initialData?.zipcodes || []);
	const [newZipcode, setNewZipcode] = useState("");
	const [formErrors, setFormErrors] = useState<{ [key: string]: string[] }>({});
	const [serverError, setServerError] = useState<string | null>(null);
	const [specifyPostcodes, setSpecifyPostcodes] = useState(
		// If editing and zipcodes exist and it's not just "all", show the postcodes field
		mode === "edit" &&
			initialData?.zipcodes &&
			!initialData.zipcodes.includes("all") &&
			initialData.zipcodes.length > 0,
	);

	useEffect(() => {
		if (initialData) {
			setCity(initialData.city);
			// Only set zipcodes if they're not just "all"
			if (initialData.zipcodes && !initialData.zipcodes.includes("all")) {
				setZipcodes(initialData.zipcodes);
			} else {
				setZipcodes([]);
			}
		}
	}, [initialData]);

	const validateCity = (cityName: string): string[] => {
		const errors: string[] = [];

		if (!cityName.trim()) {
			errors.push("City name is required");
		} else if (cityName.trim().length < 2) {
			errors.push("City name must be at least 2 characters long");
		} else if (!/^[a-zA-Z\s\-'.]+$/.test(cityName)) {
			errors.push("City name can only contain letters, spaces, hyphens, apostrophes, and periods");
		}

		return errors;
	};

	const validatePostcode = (postcode: string): boolean => {
		if (!postcode.trim()) return true;

		return UK_POSTCODE_REGEX.test(postcode) || EU_POSTCODE_REGEX.test(postcode);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);
		setFormErrors({});
		setServerError(null);

		const errors: { [key: string]: string[] } = {};

		const cityErrors = validateCity(city);
		if (cityErrors.length > 0) {
			errors.city = cityErrors;
		}

		// If specifyPostcodes is true, validate postcodes
		if (specifyPostcodes) {
			if (zipcodes.length === 0) {
				errors.zipcodes = ["At least one postcode is required when specifying postcodes"];
			} else {
				const invalidPostcodes = zipcodes.filter((zip) => !validatePostcode(zip));
				if (invalidPostcodes.length > 0) {
					errors.zipcodes = [
						"One or more postcodes are in an invalid format. Please use UK or EU format.",
					];
				}
			}
		}

		if (Object.keys(errors).length > 0) {
			setFormErrors(errors);
			setIsSubmitting(false);
			return;
		}

		try {
			const formData = new FormData();
			formData.append("city", city);

			// If not specifying postcodes, use "all" as the default value
			if (!specifyPostcodes) {
				formData.append("zipcodes", "all");
			} else {
				zipcodes.forEach((zipcode) => {
					formData.append("zipcodes", zipcode);
				});
			}

			let response;

			if (mode === "create") {
				response = await createLocation(formData);
			} else if (mode === "edit" && initialData) {
				response = await updateLocationAction(initialData.id, formData);
			}

			if (response?.success) {
				router.push("/admin/locations?refresh=true");
				router.refresh();
			} else {
				if (response?.error) {
					if (typeof response.error === "string") {
						setServerError(response.error);
					} else {
						setFormErrors(response.error);
					}
				} else {
					setServerError("Something went wrong. Please try again.");
				}
			}
		} catch (error) {
			console.error("Failed to submit location form:", error);
			setServerError("An unexpected error occurred. Please try again.");
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleAddZipcode = () => {
		if (newZipcode.trim() && !zipcodes.includes(newZipcode.trim())) {
			setZipcodes([...zipcodes, newZipcode.trim()]);
			setNewZipcode("");
		}
	};

	const handleRemoveZipcode = (index: number) => {
		setZipcodes(zipcodes.filter((_, i) => i !== index));
	};

	const handleZipcodeKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			e.preventDefault();
			handleAddZipcode();
		} else if (e.key === "Tab" && newZipcode.trim()) {
			e.preventDefault();
			handleAddZipcode();
		}
	};

	const handleSpecifyPostcodesChange = (checked: boolean) => {
		setSpecifyPostcodes(checked);
		if (formErrors.zipcodes) {
			setFormErrors({ ...formErrors, zipcodes: [] });
		}
		if (!checked) {
			setZipcodes([]);
			setNewZipcode("");
		}
	};

	return (
		<Card className="w-full max-w-2xl">
			<CardHeader>
				<CardTitle>{mode === "create" ? "Add New Location" : "Edit Location"}</CardTitle>
				<CardDescription>
					{mode === "create"
						? "Create a new service location with associated postcodes"
						: "Update location information and postcodes"}
				</CardDescription>
			</CardHeader>
			<form onSubmit={handleSubmit}>
				<CardContent className="space-y-6">
					{serverError && (
						<div className="rounded-md bg-red-50 p-3 text-sm text-red-800">{serverError}</div>
					)}

					<div className="space-y-2">
						<Label htmlFor="city">City Name</Label>
						<Input
							id="city"
							placeholder="Enter city name (UK or EU)"
							value={city}
							onChange={(e) => setCity(e.target.value)}
							disabled={isSubmitting}
							className={formErrors.city ? "border-red-300" : ""}
						/>
						{formErrors.city && <p className="text-sm text-red-500">{formErrors.city[0]}</p>}
						<p className="mt-1 text-xs text-muted-foreground">Enter a valid UK or EU city name</p>
					</div>

					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<div className="space-y-1">
								<Label>Service Area Coverage</Label>
								<p className="text-xs text-muted-foreground">
									{specifyPostcodes
										? "Enter specific postcodes where service is available"
										: "All postcodes of the city will be considered for service coverage"}
								</p>
							</div>
							<div className="flex items-center space-x-2">
								<Label htmlFor="specify-postcodes" className="text-sm font-normal">
									Specify postcodes
								</Label>
								<Switch
									id="specify-postcodes"
									checked={specifyPostcodes}
									onCheckedChange={handleSpecifyPostcodesChange}
									disabled={isSubmitting}
								/>
							</div>
						</div>

						{specifyPostcodes && (
							<div className="space-y-4">
								{formErrors.zipcodes && (
									<p className="text-sm text-red-500">{formErrors.zipcodes[0]}</p>
								)}

								<div className="rounded-lg border bg-muted/30 p-4">
									<div className="mb-2">
										<p className="text-sm text-muted-foreground">
											Enter UK (e.g., SW1A 1AA) or EU format postcodes. Press Enter or Tab to add.
										</p>
									</div>
									<div className="flex gap-2">
										<Input
											placeholder="Add postcode (UK or EU format)"
											value={newZipcode}
											onChange={(e) => setNewZipcode(e.target.value)}
											className="flex-1"
											onKeyDown={handleZipcodeKeyDown}
											disabled={isSubmitting}
										/>
										<Button
											type="button"
											variant="outline"
											onClick={handleAddZipcode}
											disabled={isSubmitting}
										>
											<PlusCircle className="size-4" />
										</Button>
									</div>

									{zipcodes.length > 0 && (
										<div className="mt-4 flex flex-wrap gap-2">
											{zipcodes.map((zipcode, index) => (
												<div
													key={index}
													className="flex items-center gap-1 rounded-md bg-primary/10 px-2 py-1 text-primary"
												>
													<span>{zipcode}</span>
													<button
														type="button"
														onClick={() => handleRemoveZipcode(index)}
														className="text-primary hover:text-primary/70"
														disabled={isSubmitting}
													>
														<X className="size-3" />
													</button>
												</div>
											))}
										</div>
									)}
								</div>
							</div>
						)}
					</div>
				</CardContent>

				<CardFooter className="flex justify-between">
					<Button
						type="button"
						variant="outline"
						onClick={() => router.back()}
						disabled={isSubmitting}
					>
						Cancel
					</Button>
					<Button type="submit" disabled={isSubmitting}>
						{isSubmitting
							? mode === "create"
								? "Creating..."
								: "Updating..."
							: mode === "create"
								? "Create Location"
								: "Update Location"}
					</Button>
				</CardFooter>
			</form>
		</Card>
	);
};
