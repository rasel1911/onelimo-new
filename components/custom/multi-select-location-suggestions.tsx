"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X, MapPin } from "lucide-react";
import { useState, useCallback, useRef, useEffect } from "react";
import { Control, FieldPath, FieldValues, Controller, useWatch } from "react-hook-form";

import { LocationAutocomplete } from "@/components/custom/location-autocomplete";
import { Badge } from "@/components/ui/badge";
import { type LocationSuggestion } from "@/lib/services/geoapify";
import { cn } from "@/lib/utils";

export interface LocationWithCoords {
	city: string;
	lat: number;
	lon: number;
	formatted: string;
}

interface MultiSelectLocationSuggestionsProps<
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
	name: TName;
	control: Control<TFieldValues>;
	placeholder?: string;
	maxSelections?: number;
	disabled?: boolean;
	className?: string;
	onLocationChange?: (locations: LocationWithCoords[]) => void;
	isEditMode?: boolean;
}

export const MultiSelectLocationSuggestions = <
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
	name,
	control,
	placeholder = "Add cities where you provide service...",
	maxSelections,
	disabled = false,
	className = "",
	onLocationChange,
	isEditMode = false,
}: MultiSelectLocationSuggestionsProps<TFieldValues, TName>) => {
	const [selectedLocations, setSelectedLocations] = useState<LocationWithCoords[]>([]);
	const [isPopoverOpen, setIsPopoverOpen] = useState(false);
	const popoverRef = useRef<HTMLDivElement>(null);

	const isMaxReached = maxSelections ? selectedLocations.length >= maxSelections : false;

	const handleLocationSelect = useCallback(
		(suggestion: LocationSuggestion, onChange: (value: string[]) => void) => {
			if (!suggestion.city || !suggestion.lat || !suggestion.lon) return;

			const locationKey = `${suggestion.lat}-${suggestion.lon}`;
			const isAlreadySelected = selectedLocations.some(
				(loc) => `${loc.lat}-${loc.lon}` === locationKey,
			);

			if (isAlreadySelected) {
				const newLocations = selectedLocations.filter(
					(loc) => `${loc.lat}-${loc.lon}` !== locationKey,
				);
				setSelectedLocations(newLocations);

				const cityNames = newLocations.map((loc) => loc.city);
				onChange(cityNames);

				onLocationChange?.(newLocations);
			} else if (!isMaxReached) {
				const newLocation: LocationWithCoords = {
					city: suggestion.city,
					lat: suggestion.lat,
					lon: suggestion.lon,
					formatted: suggestion.formatted,
				};

				const newLocations = [...selectedLocations, newLocation];
				setSelectedLocations(newLocations);

				const cityNames = newLocations.map((loc) => loc.city);
				onChange(cityNames);

				onLocationChange?.(newLocations);
			}
		},
		[selectedLocations, isMaxReached, onLocationChange],
	);

	const handleRemoveLocation = useCallback(
		(locationToRemove: LocationWithCoords, onChange: (value: string[]) => void) => {
			const locationKey = `${locationToRemove.lat}-${locationToRemove.lon}`;
			const newLocations = selectedLocations.filter(
				(loc) => `${loc.lat}-${loc.lon}` !== locationKey,
			);

			setSelectedLocations(newLocations);

			const cityNames = newLocations.map((loc) => loc.city);
			onChange(cityNames);

			onLocationChange?.(newLocations);
		},
		[selectedLocations, onLocationChange],
	);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
				setIsPopoverOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	const watchedValue = useWatch({ control, name });

	useEffect(() => {
		if (
			isEditMode &&
			Array.isArray(watchedValue) &&
			watchedValue.length > 0 &&
			selectedLocations.length === 0
		) {
			const initialLocations: LocationWithCoords[] = watchedValue.map((city: string) => ({
				city,
				lat: 0,
				lon: 0,
				formatted: city,
			}));
			setSelectedLocations(initialLocations);
			onLocationChange?.(initialLocations);
		}
	}, [isEditMode, watchedValue, selectedLocations.length, onLocationChange]);

	const handleStackClick = () => {
		setIsPopoverOpen(!isPopoverOpen);
	};

	return (
		<div className={cn("space-y-3", className)}>
			<Controller
				name={name}
				control={control}
				render={({ field: { onChange, value } }) => (
					<>
						<LocationAutocomplete
							name={`${name}_input` as TName}
							control={control}
							placeholder={isMaxReached ? "Maximum locations reached" : placeholder}
							cityOnly={true}
							disabled={disabled || isMaxReached}
							onLocationSelect={(suggestion) => handleLocationSelect(suggestion, onChange)}
							className="w-full"
							selectedLocations={selectedLocations}
						/>

						{/* Selected locations display - Popover style */}
						{selectedLocations.length > 0 && (
							<div className="space-y-2">
								<div className="text-sm font-medium text-muted-foreground">
									Selected Service Locations ({selectedLocations.length}
									{maxSelections && `/${maxSelections}`}):
								</div>

								{/* Single location display */}
								{selectedLocations.length === 1 ? (
									<motion.div
										initial={{ opacity: 0, scale: 0.95 }}
										animate={{ opacity: 1, scale: 1 }}
										exit={{ opacity: 0, scale: 0.95 }}
										transition={{ duration: 0.2 }}
									>
										<Badge
											variant="secondary"
											className="w-full justify-between gap-1 px-3 py-2 text-sm hover:bg-secondary/80"
										>
											<div className="flex items-center gap-2">
												<MapPin className="size-4" />
												{selectedLocations[0].city}
											</div>
											<button
												type="button"
												className="rounded-full outline-none ring-offset-background transition-colors hover:bg-secondary focus:ring-2 focus:ring-ring focus:ring-offset-2"
												onKeyDown={(e) => {
													if (e.key === "Enter") {
														handleRemoveLocation(selectedLocations[0], onChange);
													}
												}}
												onMouseDown={(e) => {
													e.preventDefault();
													e.stopPropagation();
												}}
												onClick={(e) => {
													e.preventDefault();
													e.stopPropagation();
													handleRemoveLocation(selectedLocations[0], onChange);
												}}
												disabled={disabled}
											>
												<X className="size-4 text-muted-foreground hover:text-foreground" />
											</button>
										</Badge>
									</motion.div>
								) : (
									/* Multiple locations - Popover style */
									<div ref={popoverRef} className="relative">
										<motion.div
											initial={{ opacity: 0, scale: 0.95 }}
											animate={{ opacity: 1, scale: 1 }}
											transition={{ duration: 0.2 }}
										>
											<Badge
												variant="secondary"
												className="w-full cursor-pointer justify-between gap-1 px-3 py-2 text-sm hover:bg-secondary/80"
												onClick={handleStackClick}
											>
												<div className="flex items-center gap-2">
													<MapPin className="size-4" />
													<span>{selectedLocations[0].city}</span>
													<span className="text-xs text-muted-foreground">
														+{selectedLocations.length - 1} more
													</span>
												</div>
												<div className="flex items-center gap-1">
													<div className="flex size-5 items-center justify-center rounded-full bg-primary/20 text-xs font-medium text-primary">
														{selectedLocations.length}
													</div>
												</div>
											</Badge>
										</motion.div>

										{/* Popover with all locations - controlled visibility */}
										<AnimatePresence>
											{isPopoverOpen && (
												<motion.div
													initial={{ opacity: 0, y: -10, scale: 0.95 }}
													animate={{ opacity: 1, y: 0, scale: 1 }}
													exit={{ opacity: 0, y: -10, scale: 0.95 }}
													transition={{ duration: 0.2 }}
													className="absolute left-0 top-full z-50 mt-2 w-full"
												>
													<div className="rounded-lg border bg-popover p-2 shadow-lg">
														<div className="space-y-1">
															<AnimatePresence mode="popLayout">
																{selectedLocations.map((location, index) => (
																	<motion.div
																		key={`${location.lat}-${location.lon}`}
																		initial={{ opacity: 0, x: -10 }}
																		animate={{ opacity: 1, x: 0 }}
																		exit={{ opacity: 0, x: -10 }}
																		transition={{ duration: 0.15, delay: index * 0.03 }}
																	>
																		<div className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-accent">
																			<div className="flex items-center gap-2">
																				<MapPin className="size-3 text-muted-foreground" />
																				<span>{location.city}</span>
																			</div>
																			<button
																				type="button"
																				className="rounded-sm p-0.5 opacity-60 outline-none ring-offset-background transition-all hover:bg-destructive/20 hover:opacity-100 focus:opacity-100 focus:ring-2 focus:ring-ring focus:ring-offset-2"
																				onKeyDown={(e) => {
																					if (e.key === "Enter") {
																						handleRemoveLocation(location, onChange);
																					}
																				}}
																				onMouseDown={(e) => {
																					e.preventDefault();
																					e.stopPropagation();
																				}}
																				onClick={(e) => {
																					e.preventDefault();
																					e.stopPropagation();
																					handleRemoveLocation(location, onChange);
																				}}
																				disabled={disabled}
																				tabIndex={0}
																			>
																				<X className="size-3 text-muted-foreground hover:text-destructive" />
																			</button>
																		</div>
																	</motion.div>
																))}
															</AnimatePresence>
														</div>
													</div>
												</motion.div>
											)}
										</AnimatePresence>
									</div>
								)}
							</div>
						)}
					</>
				)}
			/>
		</div>
	);
};
