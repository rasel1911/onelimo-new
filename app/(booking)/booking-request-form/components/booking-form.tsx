"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { MapPin, MessageSquare, Loader2, AlertCircle } from "lucide-react";
import { useState, useTransition, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";

import { improveTextAction } from "@/app/(booking)/actions/ai-writer";
import { createBookingFromForm } from "@/app/(booking)/actions/booking-actions";
import { LocationSuggestions } from "@/app/(booking)/booking-request-form/components/location-suggestions";
import { UK_CITIES } from "@/app/(booking)/booking-request-form/constants";
import {
	bookingFormSchema,
	type BookingFormData,
} from "@/app/(booking)/booking-request-form/validation/booking-form-schemas";
import { isLocationServiced } from "@/app/(booking)/concierge/utils";
import { useBookingStore } from "@/app/(booking)/store/booking-form-store";
import { AITextArea } from "@/components/ui/ai-text-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { DateTimePicker } from "@/components/ui/datetime-picker";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

interface BookingFormProps {
	onSuccess?: (requestCode: string) => void;
}

export const BookingForm = ({ onSuccess }: BookingFormProps) => {
	const [isPending, startTransition] = useTransition();

	const handleAIAction = async (params: {
		text: string;
		action: string;
		context?: string;
		customPrompt?: string;
	}) => {
		const validActions = ["rewrite", "grammar", "enhance", "simplify", "generate"];
		const mappedAction = validActions.includes(params.action) ? params.action : "enhance";

		return await improveTextAction({
			text: params.text,
			action: mappedAction as "rewrite" | "grammar" | "enhance" | "simplify" | "generate",
			context: params.context as "special_request" | "general",
			customPrompt: params.customPrompt,
		});
	};

	const {
		cities,
		citiesLoading,
		vehicleTypes,
		locationValidation,
		fetchCities,
		refreshCities,
		setLocationValidation,
		resetLocationValidation,
	} = useBookingStore();

	const [pickupSuggestions, setPickupSuggestions] = useState<string[]>([]);
	const [dropoffSuggestions, setDropoffSuggestions] = useState<string[]>([]);
	const [showPickupSuggestions, setShowPickupSuggestions] = useState(false);
	const [showDropoffSuggestions, setShowDropoffSuggestions] = useState(false);

	const [isCustomVehicleMode, setIsCustomVehicleMode] = useState(false);

	const form = useForm<BookingFormData>({
		resolver: zodResolver(bookingFormSchema),
		mode: "onChange",
		defaultValues: {
			pickupCity: "",
			pickupPostcode: "",
			dropoffCity: "",
			dropoffPostcode: "",
			pickupTime: "",
			estimatedDropoffTime: "",
			estimatedDuration: 0,
			passengers: 1,
			vehicleType: undefined,
			customVehicleType: "",
			specialRequests: "",
		},
	});

	useEffect(() => {
		if (cities.length === 0) {
			refreshCities();
		} else {
			fetchCities();
		}
	}, [cities.length, fetchCities, refreshCities]);

	const watchedValues = form.watch();
	const [isFormValidState, setIsFormValidState] = useState(false);

	const isFormValid = useCallback(() => {
		const values = form.getValues();
		const errors = form.formState.errors;

		if (Object.keys(errors).length > 0) {
			return false;
		}

		if (locationValidation.isPickupServiced === false) {
			return false;
		}

		const requiredFields = [
			values.pickupCity?.trim(),
			values.pickupPostcode?.trim(),
			values.dropoffCity?.trim(),
			values.dropoffPostcode?.trim(),
			values.pickupTime,
			values.estimatedDropoffTime,
		];

		if (!requiredFields.every((field) => field && field.length > 0)) {
			return false;
		}

		if (isCustomVehicleMode) {
			return values.customVehicleType?.trim() && values.customVehicleType.trim().length > 0;
		} else {
			return values.vehicleType && values.vehicleType.trim() !== "";
		}
	}, [form, locationValidation.isPickupServiced, isCustomVehicleMode]);

	useEffect(() => {
		const validState = isFormValid();
		const newValidState = Boolean(validState);

		setIsFormValidState(newValidState);
	}, [
		watchedValues,
		locationValidation.isPickupServiced,
		isCustomVehicleMode,
		form.formState.errors,
		form.formState.isValid,
		isFormValid,
	]);

	const handleLocationChange = (value: string, type: "pickup" | "dropoff") => {
		const setValue =
			type === "pickup"
				? (val: string) => form.setValue("pickupCity", val)
				: (val: string) => form.setValue("dropoffCity", val);

		const setSuggestions = type === "pickup" ? setPickupSuggestions : setDropoffSuggestions;
		const setShow = type === "pickup" ? setShowPickupSuggestions : setShowDropoffSuggestions;

		setValue(value);
		if (value.length > 1) {
			const availableCities = cities.length > 0 ? cities : UK_CITIES.map((loc) => loc.city);
			const filtered = availableCities.filter((city) =>
				city.toLowerCase().includes(value.toLowerCase()),
			);
			setSuggestions(filtered.slice(0, 5));
			setShow(true);
		} else {
			setShow(false);
		}
	};

	const selectLocation = (city: string, type: "pickup" | "dropoff") => {
		if (type === "pickup") {
			form.setValue("pickupCity", city);
			setShowPickupSuggestions(false);
			checkLocationService(city);
		} else {
			form.setValue("dropoffCity", city);
			setShowDropoffSuggestions(false);
		}
	};

	const checkLocationService = async (cityName: string) => {
		if (!cityName.trim()) {
			resetLocationValidation();
			return;
		}

		try {
			const availableCities = cities.length > 0 ? cities : UK_CITIES.map((loc) => loc.city);
			const isServiced = isLocationServiced(cityName, availableCities);

			if (isServiced) {
				resetLocationValidation();
			} else {
				setLocationValidation(
					cityName,
					false,
					`Sorry, we don't currently service ${cityName}. Please select a different pickup city.`,
				);
			}
		} catch (error) {
			console.error("Error checking location service:", error);
			setLocationValidation(cityName, null, "Unable to verify location service. Please try again.");
		}
	};

	const handleDateTimeChange = (date: Date | undefined, type: "pickup" | "dropoff") => {
		if (!date) return;

		const isoString = date.toISOString();

		if (type === "pickup") {
			form.setValue("pickupTime", isoString, { shouldValidate: true, shouldTouch: true });

			const dropoffTime = form.getValues("estimatedDropoffTime");
			if (dropoffTime) {
				const duration = calculateDuration(isoString, dropoffTime);
				form.setValue("estimatedDuration", duration, { shouldValidate: true });
				form.trigger("estimatedDropoffTime");
			}
		} else {
			form.setValue("estimatedDropoffTime", isoString, { shouldValidate: true, shouldTouch: true });

			const pickupTime = form.getValues("pickupTime");
			if (pickupTime) {
				const duration = calculateDuration(pickupTime, isoString);
				form.setValue("estimatedDuration", duration, { shouldValidate: true });
				form.trigger("pickupTime");
			}
		}
	};

	const calculateDuration = (pickupTime: string, dropoffTime: string) => {
		const pickupDateTime = new Date(pickupTime);
		const dropoffDateTime = new Date(dropoffTime);
		const duration = dropoffDateTime.getTime() - pickupDateTime.getTime();
		return Math.max(0, duration / 60000);
	};

	const onSubmit = async (data: BookingFormData) => {
		startTransition(async () => {
			try {
				const result = await createBookingFromForm(data);

				if (result.success) {
					toast({
						title: "Booking Created",
						description: "Your booking request has been submitted successfully.",
					});
					form.reset();
					resetLocationValidation();
					if (result.requestCode) {
						onSuccess?.(result.requestCode);
					}
				} else {
					if (result.fieldErrors) {
						Object.entries(result.fieldErrors).forEach(([field, message]) => {
							form.setError(field as keyof BookingFormData, {
								type: "server",
								message,
							});
						});
					}

					toast({
						title: "Booking Failed",
						description: result.error || "Failed to create booking",
						variant: "destructive",
					});
				}
			} catch (error) {
				console.error("Booking error:", error);
				toast({
					title: "Error",
					description: "An unexpected error occurred. Please try again.",
					variant: "destructive",
				});
			}
		});
	};

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="space-y-6 rounded-2xl border border-border bg-card p-6 shadow-lg backdrop-blur-sm"
			>
				{/* Location Error Message */}
				{locationValidation.validationMessage && locationValidation.isPickupServiced === false && (
					<Alert className="border-destructive">
						<AlertCircle className="size-4 text-destructive" />
						<AlertDescription className="text-destructive">
							{locationValidation.validationMessage}
						</AlertDescription>
					</Alert>
				)}

				{/* Journey Details */}
				<div className="space-y-4">
					<div className="flex items-center space-x-2 pb-2">
						<MapPin className="size-4 text-primary" />
						<h3 className="font-semibold text-foreground">Journey Details</h3>
						{citiesLoading && (
							<div className="flex items-center space-x-1 text-xs text-muted-foreground">
								<Loader2 className="size-3 animate-spin" />
								<span>Loading cities...</span>
							</div>
						)}
					</div>

					<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
						{/* Pickup Section */}
						<div className="space-y-3">
							<Label className="text-sm font-medium text-muted-foreground">Pickup Location</Label>
							<div className="grid grid-cols-2 gap-3">
								<FormField
									control={form.control}
									name="pickupCity"
									render={({ field }) => (
										<FormItem className="relative">
											<FormControl>
												<Input
													{...field}
													placeholder={citiesLoading ? "Loading cities..." : "City"}
													disabled={citiesLoading}
													onChange={(e) => {
														field.onChange(e);
														handleLocationChange(e.target.value, "pickup");
													}}
													onBlur={() => {
														if (field.value.trim()) {
															checkLocationService(field.value);
														}
													}}
													className={`h-10 rounded-md focus:border-primary focus:ring-1 focus:ring-primary ${
														locationValidation.isPickupServiced === false
															? "border-destructive focus:border-destructive focus:ring-destructive"
															: ""
													}`}
												/>
											</FormControl>
											<LocationSuggestions
												locations={pickupSuggestions}
												onSelect={(city) => selectLocation(city, "pickup")}
												show={showPickupSuggestions}
											/>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="pickupPostcode"
									render={({ field }) => (
										<FormItem>
											<FormControl>
												<Input
													{...field}
													placeholder="Postcode"
													onBlur={() => {
														if (field.value.trim()) {
															form.trigger("pickupPostcode");
														}
													}}
													className="h-10 rounded-md focus:border-primary focus:ring-1 focus:ring-primary"
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
						</div>

						{/* Dropoff Section */}
						<div className="space-y-3">
							<Label className="text-sm font-medium text-muted-foreground">Dropoff Location</Label>
							<div className="grid grid-cols-2 gap-3">
								<FormField
									control={form.control}
									name="dropoffCity"
									render={({ field }) => (
										<FormItem className="relative">
											<FormControl>
												<Input
													{...field}
													placeholder={citiesLoading ? "Loading cities..." : "City"}
													disabled={citiesLoading}
													onChange={(e) => {
														field.onChange(e);
														handleLocationChange(e.target.value, "dropoff");
													}}
													onBlur={() => {
														if (field.value.trim()) {
															form.trigger("dropoffCity");
														}
													}}
													className="h-10 rounded-md focus:border-primary focus:ring-1 focus:ring-primary"
												/>
											</FormControl>
											<LocationSuggestions
												locations={dropoffSuggestions}
												onSelect={(city) => selectLocation(city, "dropoff")}
												show={showDropoffSuggestions}
											/>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="dropoffPostcode"
									render={({ field }) => (
										<FormItem>
											<FormControl>
												<Input
													{...field}
													placeholder="Postcode"
													onBlur={() => {
														if (field.value.trim()) {
															form.trigger("dropoffPostcode");
														}
													}}
													className="h-10 rounded-md focus:border-primary focus:ring-1 focus:ring-primary"
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
						</div>
					</div>
				</div>

				{/* DateTime & Trip Details Grid */}
				<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
					{/* DateTime Section */}
					<div className="space-y-3">
						<FormField
							control={form.control}
							name="pickupTime"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="text-sm text-muted-foreground">
										Pickup Date & Time
									</FormLabel>
									<FormControl>
										<DateTimePicker
											value={field.value ? new Date(field.value) : undefined}
											onChange={(date) => handleDateTimeChange(date, "pickup")}
											placeholder="Select pickup date & time"
											disabledDates={(date) => date < new Date()}
											className="h-10 rounded-md hover:border-primary"
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="estimatedDropoffTime"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="text-sm text-muted-foreground">
										Dropoff Date & Time
									</FormLabel>
									<FormControl>
										<DateTimePicker
											value={field.value ? new Date(field.value) : undefined}
											onChange={(date) => handleDateTimeChange(date, "dropoff")}
											placeholder="Select dropoff date & time"
											disabledDates={(date) => date < new Date()}
											className="h-10 rounded-md hover:border-primary"
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>

					{/* Trip Details */}
					<div className="space-y-3">
						<FormField
							control={form.control}
							name="passengers"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="text-sm text-muted-foreground">Passengers</FormLabel>
									<Select
										value={field.value.toString()}
										onValueChange={(value) => field.onChange(parseInt(value))}
									>
										<FormControl>
											<SelectTrigger className="h-10 rounded-md">
												<SelectValue />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											{[...Array(50)].map((_, index) => (
												<SelectItem key={index + 1} value={(index + 1).toString()}>
													{index + 1}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Vehicle Type - Show select or manual input */}
						{isCustomVehicleMode ? (
							<FormField
								control={form.control}
								name="customVehicleType"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="text-sm text-muted-foreground">
											Specify Vehicle Type
										</FormLabel>
										<FormControl>
											<Input
												{...field}
												placeholder="Enter your preferred vehicle type"
												onChange={(e) => {
													field.onChange(e);
													form.setValue("vehicleType", e.target.value as any);
												}}
												onBlur={() => {
													if (field.value?.trim()) {
														form.trigger("customVehicleType");
														form.setValue("vehicleType", field.value as any);
													}
												}}
												className="h-10 rounded-md focus:border-primary focus:ring-1 focus:ring-primary"
											/>
										</FormControl>
										<FormMessage />
										<div className="mt-2">
											<Button
												type="button"
												variant="outline"
												size="sm"
												onClick={() => {
													setIsCustomVehicleMode(false);
													form.setValue("vehicleType", "" as any);
													form.setValue("customVehicleType", "");
												}}
												className="text-xs"
											>
												← Back to vehicle selection
											</Button>
										</div>
									</FormItem>
								)}
							/>
						) : (
							<FormField
								control={form.control}
								name="vehicleType"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="text-sm text-muted-foreground">Vehicle Type</FormLabel>
										<Select
											value={field.value}
											onValueChange={(value) => {
												if (value === "other") {
													setIsCustomVehicleMode(true);
													form.setValue("customVehicleType", "");
												} else {
													field.onChange(value);
												}
											}}
										>
											<FormControl>
												<SelectTrigger className="h-10 rounded-md">
													<SelectValue placeholder="Select vehicle" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{/* Vehicle Types */}
												{vehicleTypes.map((type) => (
													<SelectItem key={type.value} value={type.value}>
														<div className="flex flex-col">
															<span className="text-left font-medium">{type.label}</span>
															<span className="text-xs text-muted-foreground">
																{type.description}
															</span>
														</div>
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>
						)}
					</div>
				</div>

				{/* Special Requests & Submit */}
				<div className="space-y-4">
					<FormField
						control={form.control}
						name="specialRequests"
						render={({ field }) => (
							<FormItem>
								<FormLabel className="flex items-center text-sm text-muted-foreground">
									<MessageSquare className="mr-1 size-3" />
									Special Requests (Optional)
								</FormLabel>
								<FormControl>
									<AITextArea
										value={field.value}
										onChange={field.onChange}
										placeholder="Any special requirements or requests for your ride..."
										className="w-full"
										minHeight={80}
										maxHeight={200}
										rows={2}
										context="special_request"
										aiActionHandler={handleAIAction}
										onAIAction={(
											action: string,
											originalText: string,
											improvedText: string,
											improvements: string[],
										) => {
											if (action.endsWith("_error")) {
												toast({
													title: "AI Enhancement Failed",
													description: improvements[0] || "Failed to improve text",
													variant: "destructive",
												});
											} else {
												toast({
													title: "Text Enhanced",
													description: `Your text has been improved using AI ${action}.`,
												});
											}
										}}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<Button
						type="submit"
						disabled={isPending || !isFormValidState}
						className="h-12 w-full rounded-lg bg-gradient-to-r from-primary to-primary/80 text-lg font-semibold transition-all duration-300 hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 disabled:hover:scale-100"
					>
						{isPending ? (
							<div className="flex items-center space-x-2">
								<Loader2 className="size-4 animate-spin" />
								<span>Creating Booking...</span>
							</div>
						) : (
							"Confirm Booking"
						)}
					</Button>
				</div>
			</form>
		</Form>
	);
};
