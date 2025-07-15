import { create } from "zustand";
import { persist } from "zustand/middleware";

import { BookingSlice } from "@/app/(booking)/concierge/types";

import { createBookingSlice } from "./slices/booking-slice";
import { ConversationSlice, createConversationSlice } from "./slices/conversation-slice";
import { UISlice, createUISlice } from "./slices/ui-slice";
import { UserSlice, createUserSlice } from "./slices/user-slice";

export type AgentStore = BookingSlice & ConversationSlice & UISlice & UserSlice;

export const useAgentStore = create<AgentStore>()(
	persist(
		(...a) => ({
			...createBookingSlice(...a),
			...createConversationSlice(...a),
			...createUISlice(...a),
			...createUserSlice(...a),
		}),
		{
			name: "agent-store",
			partialize: (state) => ({
				bookingInfo: state.bookingInfo,
				bookingConfirmed: state.bookingConfirmed,
				bookingId: state.bookingId,
				conversations: state.conversations,
				currentConversationId: state.currentConversationId,
				userData: state.userData,
			}),
		},
	),
);
