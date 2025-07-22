"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, Loader2, MapPin, Plus, Search, X } from "lucide-react";
import { useCallback, useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocations, type Location } from "@/hooks/use-locations";

interface MultiSelectLocationsProps {
	value: string[];
	onChange: (value: string[]) => void;
	placeholder?: string;
	maxSelections?: number;
	disabled?: boolean;
	required?: boolean;
	onCreateLocation?: (cityName: string) => Promise<{ success: boolean; location?: Location }>;
	className?: string;
	createLocationText?: string;
	addLocationButtonText?: string;
}

export function MultiSelectLocations({
	value = [],
	onChange,
	placeholder = "Select locations...",
	maxSelections,
	disabled = false,
	required = false,
	onCreateLocation,
	className,
	createLocationText = "Can't find your location?",
	addLocationButtonText = "Add your location",
}: MultiSelectLocationsProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [showCreateDialog, setShowCreateDialog] = useState(false);
	const [newLocationName, setNewLocationName] = useState("");
	const [isCreating, setIsCreating] = useState(false);
	const [showAddButton, setShowAddButton] = useState(false);

	const { isLoading, error, searchLocations, getLocationsByIds, refresh } = useLocations({
		showToast: false,
	});

	const triggerRef = useRef<HTMLButtonElement>(null);

	const selectedLocations = getLocationsByIds(value);
	const filteredLocations = searchLocations(searchQuery);

	const isMaxReached = maxSelections ? value.length >= maxSelections : false;

	const handleSelect = useCallback(
		(locationId: string) => {
			if (value.includes(locationId)) {
				onChange(value.filter((id) => id !== locationId));
			} else if (!isMaxReached) {
				onChange([...value, locationId]);
			}
		},
		[value, onChange, isMaxReached],
	);

	const handleRemove = useCallback(
		(locationId: string, event?: React.MouseEvent) => {
			event?.stopPropagation();
			onChange(value.filter((id) => id !== locationId));
		},
		[value, onChange],
	);

	const handleCreateLocation = async () => {
		if (!newLocationName.trim() || !onCreateLocation) return;

		setIsCreating(true);
		try {
			const result = await onCreateLocation(newLocationName.trim());
			if (result.success && result.location) {
				onChange([...value, result.location.id]);
				setNewLocationName("");
				setShowCreateDialog(false);
				refresh();
			}
		} catch (error) {
			console.error("Failed to create location:", error);
		} finally {
			setIsCreating(false);
		}
	};

	const LoadingSkeleton = () => (
		<div className="space-y-2 p-2">
			{[...Array(3)].map((_, i) => (
				<div key={i} className="flex items-center space-x-2">
					<Skeleton className="h-4 w-4 rounded" />
					<Skeleton className="h-4 flex-1" />
				</div>
			))}
		</div>
	);

	const EmptyState = () => (
		<div className="flex flex-col items-center justify-center py-6 text-center">
			<MapPin className="mb-2 h-8 w-8 text-muted-foreground" />
			<p className="mb-2 text-sm text-muted-foreground">
				{searchQuery ? "No locations found" : "No locations available"}
			</p>
			{onCreateLocation && searchQuery && (
				<Button
					variant="ghost"
					size="sm"
					onClick={() => {
						setNewLocationName(searchQuery);
						setShowCreateDialog(true);
						setIsOpen(false);
					}}
					className="text-primary"
				>
					<Plus className="mr-1 h-4 w-4" />
					Create "{searchQuery}"
				</Button>
			)}
		</div>
	);

	return (
		<div className={className}>
			<Popover
				open={isOpen}
				onOpenChange={(open) => {
					setIsOpen(open);
					if (!open) {
						setShowAddButton(false);
					}
				}}
			>
				<PopoverTrigger asChild>
					<Button
						ref={triggerRef}
						variant="outline"
						role="combobox"
						aria-expanded={isOpen}
						disabled={disabled}
						className="h-auto min-h-10 w-full justify-between py-2"
					>
						<div className="flex min-h-6 flex-1 flex-wrap gap-1">
							<AnimatePresence mode="popLayout">
								{selectedLocations.length > 0 ? (
									selectedLocations.map((location) => (
										<motion.div
											key={location.id}
											initial={{ opacity: 0, scale: 0.8 }}
											animate={{ opacity: 1, scale: 1 }}
											exit={{ opacity: 0, scale: 0.8 }}
											transition={{ duration: 0.15 }}
										>
											<Badge
												variant="secondary"
												className="gap-1 px-2 py-1 text-xs hover:bg-secondary/80"
											>
												<MapPin className="h-3 w-3" />
												{location.city}
												<button
													type="button"
													className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
													onKeyDown={(e) => {
														if (e.key === "Enter") {
															handleRemove(location.id);
														}
													}}
													onMouseDown={(e) => {
														e.preventDefault();
														e.stopPropagation();
													}}
													onClick={(e) => handleRemove(location.id, e)}
												>
													<X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
												</button>
											</Badge>
										</motion.div>
									))
								) : (
									<motion.span
										initial={{ opacity: 0 }}
										animate={{ opacity: 1 }}
										className="text-muted-foreground"
									>
										{placeholder}
									</motion.span>
								)}
							</AnimatePresence>
						</div>
						<div className="flex items-center gap-2">
							{isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
							<ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
						</div>
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
					<div className="flex flex-col">
						{/* Search Input - Single search icon */}
						<div className="flex items-center border-b px-3 py-2">
							<Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
							<Input
								placeholder="Search locations..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="flex-1 border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
							/>
						</div>

						{/* Content */}
						<div className="max-h-64 overflow-y-auto">
							{isLoading ? (
								<LoadingSkeleton />
							) : error ? (
								<div className="flex flex-col items-center justify-center py-6 text-center">
									<p className="mb-2 text-sm text-destructive">{error}</p>
									<Button variant="ghost" size="sm" onClick={refresh}>
										Try again
									</Button>
								</div>
							) : (
								<>
									{filteredLocations.length === 0 ? (
										<div className="p-4">
											<EmptyState />
										</div>
									) : (
										<div className="p-1">
											{filteredLocations.map((location) => {
												const isSelected = value.includes(location.id);
												const canSelect = !isMaxReached || isSelected;

												return (
													<div
														key={location.id}
														onClick={() => canSelect && handleSelect(location.id)}
														className={`flex cursor-pointer items-center gap-2 rounded-sm px-3 py-2 hover:bg-accent ${
															!canSelect ? "cursor-not-allowed opacity-50" : ""
														}`}
													>
														<div
															className={`flex h-4 w-4 items-center justify-center rounded-sm border border-primary ${
																isSelected ? "bg-primary text-primary-foreground" : ""
															}`}
														>
															{isSelected && <Check className="h-3 w-3" />}
														</div>
														<div className="flex flex-1 items-center gap-2">
															<MapPin className="h-4 w-4 text-muted-foreground" />
															<span className="flex-1">{location.city}</span>
															{location.zipcodes && location.zipcodes.length > 0 && (
																<span className="text-xs text-muted-foreground">all postcodes</span>
															)}
														</div>
													</div>
												);
											})}
										</div>
									)}

									{onCreateLocation && (
										<>
											<Separator />
											<div className="p-3">
												{!showAddButton ? (
													<button
														type="button"
														onClick={() => setShowAddButton(true)}
														className="w-full cursor-pointer text-left text-sm text-muted-foreground transition-colors hover:text-foreground"
													>
														{createLocationText}{" "}
														<span className="text-primary underline">Click here</span>
													</button>
												) : (
													<Button
														variant="ghost"
														size="sm"
														onClick={() => setShowCreateDialog(true)}
														className="w-full justify-start text-primary"
													>
														<Plus className="mr-2 h-4 w-4" />
														{addLocationButtonText}
													</Button>
												)}
											</div>
										</>
									)}
								</>
							)}
						</div>
					</div>
				</PopoverContent>
			</Popover>

			{/* Max selections message */}
			{maxSelections && value.length >= maxSelections && (
				<motion.p
					initial={{ opacity: 0, y: -10 }}
					animate={{ opacity: 1, y: 0 }}
					className="mt-1 text-sm text-muted-foreground"
				>
					Maximum {maxSelections} locations selected
				</motion.p>
			)}

			{/* Create Location Dialog */}
			<Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>{addLocationButtonText}</DialogTitle>
						<DialogDescription>
							Create a new service location that will be available for all providers.
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4 py-4">
						<div className="space-y-2">
							<Label htmlFor="location-name">City Name</Label>
							<Input
								id="location-name"
								placeholder="Enter city name"
								value={newLocationName}
								onChange={(e) => setNewLocationName(e.target.value)}
								onKeyDown={(e) => {
									if (e.key === "Enter" && !isCreating) {
										handleCreateLocation();
									}
								}}
							/>
						</div>
					</div>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => {
								setShowCreateDialog(false);
								setNewLocationName("");
							}}
							disabled={isCreating}
						>
							Cancel
						</Button>
						<Button onClick={handleCreateLocation} disabled={!newLocationName.trim() || isCreating}>
							{isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
							Create Location
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
