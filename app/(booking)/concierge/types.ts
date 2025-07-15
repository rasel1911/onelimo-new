export interface MessageProps {
	role: "user" | "assistant";
	content: string;
	toolCalls?: Array<{
		id: string;
		name: string;
		args: any;
		result?: any;
		status: "pending" | "completed" | "error";
	}>;
	timestamp: number;
	messageStatus: "streaming" | "submitted" | "ready" | "error";
	isLastMessage: boolean;
}

export interface Location {
	cityName: string;
	postCode?: string;
	fullAddress?: string;
}

/********************
 * STORE & SLICES TYPES
 ********************/
export interface BookingInfo {
	pickupLocation?: Location;
	dropoffLocation?: Location;
	pickupDateTime?: string;
	dropoffDateTime?: string;
	passengers?: number;
	specialRequests?: string;
	vehicleType?: string;
	duration?: string;
}

export interface BookingSlice {
	bookingInfo: BookingInfo;
	bookingConfirmed: boolean;
	bookingId?: string;

	updateBookingInfo: (info: Partial<BookingInfo>) => void;
	resetBookingInfo: () => void;
	setBookingConfirmed: (confirmed: boolean, bookingId?: string) => void;
}

export interface Message {
	id: string;
	role: "user" | "assistant";
	content: string;
	timestamp: number;
	toolCalls?: ToolCall[];
}

export interface Conversation {
	id: string;
	messages: Message[];
}

export interface BuildSystemPromptOptions {
	bookingContext?: BookingInfo;
	userName?: string;
}

/***************************
 * TOOL CALLS & HOOKS TYPES
 ***************************/
export interface ToolCall {
	id: string;
	name: string;
	args: any;
	result?: any;
	status: "pending" | "completed" | "error";
}

export interface UseToolHandlerOptions {
	conversationId: string;
	onToolCallUpdate: (toolCall: {
		id: string;
		name: string;
		args: any;
		status: "pending" | "completed" | "error";
	}) => void;
	onToolCallComplete: (toolCallId: string) => void;
	onClearMessages: () => void;
}

export interface ExtendedMessage {
	id: string;
	role: "user" | "assistant";
	content: string;
	timestamp: number;
	toolCalls?: Array<{
		id: string;
		name: string;
		args: any;
		result?: any;
		status: "pending" | "completed" | "error";
	}>;
}

export interface UseMessageManagerOptions {
	conversationId: string;
	initialMessages: ExtendedMessage[];
}

export interface UseConversationManagerOptions {
	conversationId: string;
}

export interface UseAgentChatOptions {
	conversationId: string;
}

export interface EmptyStateProps {
	isVisible: boolean;
}

export interface ConfirmationOverlayProps {
	bookingInfo: BookingInfo;
}

export interface InfoBadgeProps {
	icon: React.ReactNode;
	content: React.ReactNode;
	positionClasses: string;
}

export interface ChatProps {
	conversationId: string;
}

export interface ToolIndicatorProps {
	toolName: string;
	status: "pending" | "completed" | "error";
	args?: any;
	result?: any;
}
