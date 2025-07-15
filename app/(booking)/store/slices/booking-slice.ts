import { StateCreator } from "zustand";

import { BookingSlice } from "@/app/(booking)/concierge/types";

export const createBookingSlice: StateCreator<BookingSlice, [], [], BookingSlice> = (set) => ({
	bookingInfo: {},
	bookingConfirmed: false,

	updateBookingInfo: (info) =>
		set((state) => ({
			bookingInfo: { ...state.bookingInfo, ...info },
		})),

	resetBookingInfo: () =>
		set({
			bookingInfo: {},
			bookingConfirmed: false,
			bookingId: undefined,
		}),

	setBookingConfirmed: (confirmed, bookingId) =>
		set({
			bookingConfirmed: confirmed,
			bookingId: confirmed ? bookingId : undefined,
		}),
});
