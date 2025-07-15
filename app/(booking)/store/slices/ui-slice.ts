import { StateCreator } from "zustand";

export interface CurrentToolCall {
	id: string;
	name: string;
	args: any;
}

export interface UISlice {
	isProcessing: boolean;
	currentToolCall?: CurrentToolCall;

	setProcessing: (processing: boolean) => void;
	setCurrentToolCall: (toolCall?: CurrentToolCall) => void;
}

export const createUISlice: StateCreator<UISlice, [], [], UISlice> = (set) => ({
	isProcessing: false,

	setProcessing: (processing) => set({ isProcessing: processing }),

	setCurrentToolCall: (toolCall) => set({ currentToolCall: toolCall }),
});
