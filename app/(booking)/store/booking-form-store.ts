import { create } from "zustand";
import { persist } from "zustand/middleware";

import { fetchCitiesAction } from "@/app/(booking)/actions/fetch-cities-action";

// FIXME: This file need to be refactored and clean unused code
export const VEHICLE_TYPES = [
	{
		value: "premium_suv",
		label: "Premium SUV",
		description: "Sport Utility Vehicle for comfort and space",
	},
	{ value: "party_bus", label: "Party Bus", description: "Large vehicle for group events" },
	{
		value: "stretch_limousine",
		label: "Stretch Limousine",
		description: "Luxury stretch limousine",
	},
	{
		value: "luxury_sedan",
		label: "Luxury Sedan",
		description: "Premium sedan with luxury features",
	},
	{ value: "hummer", label: "Hummer", description: "Heavy-duty luxury vehicle" },
	{ value: "other", label: "Other", description: "Specify your vehicle preference" },
] as const;

export type VehicleType = (typeof VEHICLE_TYPES)[number]["value"];

export interface BookingStore {
	cities: string[];
	citiesLoading: boolean;
	citiesError: string | null;
	vehicleTypes: typeof VEHICLE_TYPES;
	locationValidation: {
		pickupCity: string;
		isPickupServiced: boolean | null;
		validationMessage: string | null;
	};
	fetchCities: (force?: boolean) => Promise<void>;
	refreshCities: () => Promise<void>;
	clearCitiesCache: () => void;
	setLocationValidation: (city: string, isServiced: boolean | null, message: string | null) => void;
	resetLocationValidation: () => void;
}

export const useBookingStore = create<BookingStore>()(
	persist(
		(set, get) => ({
			cities: [],
			citiesLoading: false,
			citiesError: null,
			vehicleTypes: VEHICLE_TYPES,
			locationValidation: {
				pickupCity: "",
				isPickupServiced: null,
				validationMessage: null,
			},

			fetchCities: async (force = false) => {
				const { cities, citiesLoading } = get();

				if (citiesLoading || (!force && cities.length > 0)) return;

				set({ citiesLoading: true, citiesError: null });

				try {
					const cities = await fetchCitiesAction(force);
					set({
						cities,
						citiesLoading: false,
						citiesError: null,
					});
				} catch (error) {
					console.error("Failed to fetch cities:", error);
					set({
						citiesLoading: false,
						citiesError: "Failed to load cities. Please try again.",
					});
				}
			},

			refreshCities: async () => {
				const { fetchCities } = get();
				await fetchCities(true);
			},

			clearCitiesCache: () => {
				set({ cities: [], citiesError: null });
			},

			setLocationValidation: (city, isServiced, message) => {
				set({
					locationValidation: {
						pickupCity: city,
						isPickupServiced: isServiced,
						validationMessage: message,
					},
				});
			},

			resetLocationValidation: () => {
				set({
					locationValidation: {
						pickupCity: "",
						isPickupServiced: null,
						validationMessage: null,
					},
				});
			},
		}),
		{
			name: "booking-store",
			partialize: (state) => ({
				cities: state.cities,
			}),
		},
	),
);
