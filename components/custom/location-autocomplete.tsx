"use client";

import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Loader2, X, Building2, Check } from "lucide-react";
import { useState, useRef, useEffect, forwardRef } from "react";
import { Controller, type Control, type FieldPath, type FieldValues } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocationSearch } from "@/hooks/use-location-search";
import { type LocationSuggestion } from "@/lib/services/geoapify";
import { cn } from "@/lib/utils";

export interface LocationAutocompleteProps<
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
	name: TName;
	control: Control<TFieldValues>;
	placeholder?: string;
	disabled?: boolean;
	onLocationSelect?: (location: LocationSuggestion) => void;
	cityOnly?: boolean;
	className?: string;
	selectedLocations?: LocationSuggestion[];
}

interface SuggestionListProps {
	suggestions: LocationSuggestion[];
	isOpen: boolean;
	highlightedIndex: number;
	onSelect: (suggestion: LocationSuggestion) => void;
	onMouseEnter: (index: number) => void;
	cityOnly: boolean;
	selectedLocations?: LocationSuggestion[];
}

interface LocationInputProps {
	value: string;
	onChange: (value: string) => void;
	onKeyDown: (e: React.KeyboardEvent) => void;
	onFocus: () => void;
	placeholder?: string;
	disabled?: boolean;
	isLoading?: boolean;
	onClear?: () => void;
}

const SuggestionList = ({
	suggestions,
	isOpen,
	highlightedIndex,
	onSelect,
	onMouseEnter,
	cityOnly,
	selectedLocations = [],
}: SuggestionListProps) => {
	return (
		<AnimatePresence>
			{isOpen && suggestions.length > 0 && (
				<motion.div
					initial={{ opacity: 0, y: -10, scale: 0.95 }}
					animate={{ opacity: 1, y: 0, scale: 1 }}
					exit={{ opacity: 0, y: -10, scale: 0.95 }}
					transition={{ duration: 0.15, ease: "easeOut" }}
					className="absolute z-50 mt-2 max-h-60 w-full overflow-hidden rounded-lg border border-border bg-popover shadow-lg"
				>
					<div className="max-h-60 overflow-y-auto">
						{suggestions.map((suggestion, index) => {
							const primaryText = cityOnly
								? suggestion.city || suggestion.address_line1
								: suggestion.address_line1 && suggestion.postcode
									? `${suggestion.address_line1}, ${suggestion.postcode}`
									: suggestion.address_line1;
							const secondaryText = cityOnly ? suggestion.formatted : suggestion.address_line2;
							const IconComponent = cityOnly ? Building2 : MapPin;

							const isSelected = selectedLocations.some(
								(selected) =>
									selected.lat === suggestion.lat &&
									selected.lon === suggestion.lon &&
									selected.city === suggestion.city,
							);

							return (
								<button
									key={`${suggestion.lat}-${suggestion.lon}-${index}`}
									type="button"
									onClick={() => onSelect(suggestion)}
									onMouseEnter={() => onMouseEnter(index)}
									className={cn(
										"w-full px-4 py-3 text-left transition-colors hover:bg-accent focus:bg-accent focus:outline-none",
										index === highlightedIndex && "bg-accent",
										isSelected && "bg-primary/10",
									)}
									role="option"
									aria-selected={index === highlightedIndex}
								>
									<div className="flex items-start space-x-3">
										<IconComponent className="mt-1 size-4 shrink-0 text-muted-foreground" />
										<div className="min-w-0 flex-1">
											<div className="truncate font-medium text-foreground">{primaryText}</div>
											{secondaryText && primaryText !== secondaryText && (
												<div className="truncate text-sm text-muted-foreground">
													{secondaryText}
												</div>
											)}
										</div>
										{isSelected && <Check className="mt-1 size-4 shrink-0 text-primary" />}
									</div>
								</button>
							);
						})}
					</div>
				</motion.div>
			)}
		</AnimatePresence>
	);
};

const LocationInput = forwardRef<HTMLInputElement, LocationInputProps>(
	({ value, onChange, onKeyDown, onFocus, placeholder, disabled, isLoading, onClear }, ref) => (
		<div className="relative">
			<MapPin className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

			<Input
				ref={ref}
				value={value}
				onChange={(e) => onChange(e.target.value)}
				onKeyDown={onKeyDown}
				onFocus={onFocus}
				placeholder={placeholder}
				disabled={disabled}
				className="px-10"
				role="combobox"
				aria-expanded={false}
				aria-autocomplete="list"
			/>

			<div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center space-x-1">
				{isLoading && (
					<Loader2
						className="size-4 animate-spin text-muted-foreground"
						aria-label="Loading suggestions"
					/>
				)}

				{value && !isLoading && onClear && (
					<Button
						type="button"
						variant="ghost"
						size="sm"
						onClick={onClear}
						className="size-6 p-0 hover:bg-transparent"
						aria-label="Clear input"
					>
						<X className="size-3 text-muted-foreground hover:text-foreground" />
					</Button>
				)}
			</div>
		</div>
	),
);

LocationInput.displayName = "LocationInput";

export const LocationAutocomplete = <
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
	name,
	control,
	placeholder = "Enter address, city, or postcode",
	disabled = false,
	onLocationSelect,
	cityOnly = false,
	className = "",
	selectedLocations = [],
}: LocationAutocompleteProps<TFieldValues, TName>) => {
	const [isOpen, setIsOpen] = useState(false);
	const [highlightedIndex, setHighlightedIndex] = useState(-1);
	const [inputValue, setInputValue] = useState("");

	const inputRef = useRef<HTMLInputElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);

	const { suggestions, isLoading, debouncedSearch } = useLocationSearch({
		type: cityOnly ? "city" : undefined,
		limit: 6,
	});

	const handleInputChange = (value: string) => {
		setInputValue(value);
		debouncedSearch(value);

		if (value.length >= 2) {
			setIsOpen(true);
			setHighlightedIndex(-1);
		} else {
			setIsOpen(false);
		}
	};

	const handleSuggestionSelect = (
		suggestion: LocationSuggestion,
		onChange: (value: string) => void,
	) => {
		const displayValue = cityOnly
			? suggestion.city || suggestion.address_line1 || suggestion.formatted
			: suggestion.address_line1 && suggestion.postcode
				? `${suggestion.address_line1}, ${suggestion.postcode}`
				: suggestion.address_line1 || suggestion.formatted;
		setInputValue(displayValue);
		onChange(displayValue);
		setIsOpen(false);
		onLocationSelect?.(suggestion);
		inputRef.current?.blur();
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (!isOpen || suggestions.length === 0) return;

		switch (e.key) {
			case "ArrowDown":
				e.preventDefault();
				setHighlightedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev));
				break;
			case "ArrowUp":
				e.preventDefault();
				setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
				break;
			case "Enter":
				e.preventDefault();
				if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
					const suggestion = suggestions[highlightedIndex];
					const displayValue = cityOnly
						? suggestion.city || suggestion.address_line1 || suggestion.formatted
						: suggestion.address_line1 && suggestion.postcode
							? `${suggestion.address_line1}, ${suggestion.postcode}`
							: suggestion.address_line1 || suggestion.formatted;
					setInputValue(displayValue);
					setIsOpen(false);
					onLocationSelect?.(suggestion);
				}
				break;
			case "Escape":
				setIsOpen(false);
				setHighlightedIndex(-1);
				inputRef.current?.blur();
				break;
		}
	};

	const handleClear = (onChange: (value: string) => void) => {
		setInputValue("");
		onChange("");
		setIsOpen(false);
		inputRef.current?.focus();
	};

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
				setIsOpen(false);
				setHighlightedIndex(-1);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	return (
		<div ref={containerRef} className={cn("relative", className)}>
			<Controller
				name={name}
				control={control}
				render={({ field: { onChange, onBlur, value } }) => {
					if (value !== inputValue) {
						setInputValue(value || "");
					}

					const listboxId = `location-listbox-${name}`;

					return (
						<div
							role="combobox"
							aria-expanded={isOpen}
							aria-haspopup="listbox"
							aria-controls={listboxId}
						>
							<LocationInput
								ref={inputRef}
								value={inputValue}
								onChange={(newValue) => {
									handleInputChange(newValue);
									onChange(newValue);
								}}
								onKeyDown={handleKeyDown}
								onFocus={() => {
									if (suggestions.length > 0) {
										setIsOpen(true);
									}
								}}
								placeholder={placeholder}
								disabled={disabled}
								isLoading={isLoading}
								onClear={() => handleClear(onChange)}
							/>

							<div id={listboxId} role="listbox" aria-label="Location suggestions">
								<SuggestionList
									suggestions={suggestions}
									isOpen={isOpen}
									highlightedIndex={highlightedIndex}
									onSelect={(suggestion) => handleSuggestionSelect(suggestion, onChange)}
									onMouseEnter={setHighlightedIndex}
									cityOnly={cityOnly}
									selectedLocations={selectedLocations}
								/>
							</div>
						</div>
					);
				}}
			/>
		</div>
	);
};
