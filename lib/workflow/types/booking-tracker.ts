import { WorkflowTrackingData, WorkflowStep } from "@/lib/types/workflow-tracking";

export interface BookingTrackerProps {
	className?: string;
	selectedBookingId?: string | null;
}

export interface BookingTrackerContentProps {
	className?: string;
	selectedBookingId?: string | null;
}

export interface BookingHeaderProps {
	selectedBooking: WorkflowTrackingData;
	workflowData: WorkflowTrackingData[];
	isLoading: boolean;
	onRefetch: () => void;
	onBookingSelect: (booking: WorkflowTrackingData) => void;
}

export interface BookingStepsListProps {
	steps: WorkflowStep[];
	selectedBooking: WorkflowTrackingData;
	onModalOpen: (type: string, data: any) => void;
}

export interface BookingStepProps {
	step: WorkflowStep;
	selectedBooking: WorkflowTrackingData;
	onModalOpen: (type: string, data: any) => void;
}

export interface StatusBadgeProps {
	status: string;
	variant?: "default" | "outline";
}

export interface StepIconProps {
	stepName: string;
	className?: string;
}

export interface NotificationStepContentProps {
	step: WorkflowStep;
	selectedBooking: WorkflowTrackingData;
	onModalOpen: (type: string, data: any) => void;
}

export interface ProvidersStepContentProps {
	step: WorkflowStep;
	selectedBooking: WorkflowTrackingData;
	onModalOpen: (type: string, data: any) => void;
}

export interface QuotesStepContentProps {
	step: WorkflowStep;
	selectedBooking: WorkflowTrackingData;
	onModalOpen: (type: string, data: any) => void;
}

export interface ModalState {
	activeModal: string | null;
	modalData: any;
}

export interface ModalActions {
	openModal: (type: string, data: any) => void;
	closeModal: () => void;
}
