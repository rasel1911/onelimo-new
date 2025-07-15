import { MODAL_TYPES } from "@/lib/workflow/constants/booking-tracker";

import { BookingDetailsModal } from "./workflow/bookingRequest/booking-details-modal";
import { CompleteModal } from "./workflow/Complete";
import { ConfirmationModal } from "./workflow/Confirmation";
import { MessageDetailsModal } from "./workflow/Message/message-details-modal";
import { NotificationDetailsModal } from "./workflow/Notification";
import { ProviderDetailsModal } from "./workflow/Providers/provider-details-modal";
import { QuoteDetailsModal } from "./workflow/Quotes/quote-details-modal";
import { UserResponseModal } from "./workflow/UserResponse";

interface BookingTrackerModalsProps {
	activeModal: string | null;
	modalData: any;
	onCloseModal: () => void;
}

export function BookingTrackerModals({
	activeModal,
	modalData,
	onCloseModal,
}: BookingTrackerModalsProps) {
	return (
		<>
			{activeModal === MODAL_TYPES.BOOKING && (
				<BookingDetailsModal
					isOpen={activeModal === MODAL_TYPES.BOOKING}
					onCloseAction={onCloseModal}
					data={modalData}
				/>
			)}

			{activeModal === MODAL_TYPES.MESSAGE && (
				<MessageDetailsModal
					isOpen={activeModal === MODAL_TYPES.MESSAGE}
					onCloseAction={onCloseModal}
					data={modalData}
				/>
			)}

			{activeModal === MODAL_TYPES.NOTIFICATION && (
				<NotificationDetailsModal
					isOpen={activeModal === MODAL_TYPES.NOTIFICATION}
					onCloseAction={onCloseModal}
					data={modalData}
				/>
			)}

			{activeModal === MODAL_TYPES.PROVIDERS && (
				<ProviderDetailsModal
					isOpen={activeModal === MODAL_TYPES.PROVIDERS}
					onCloseAction={onCloseModal}
					data={modalData}
				/>
			)}

			{activeModal === MODAL_TYPES.QUOTES && (
				<QuoteDetailsModal
					isOpen={activeModal === MODAL_TYPES.QUOTES}
					onCloseAction={onCloseModal}
					workflowRunId={modalData?.workflowRunId}
				/>
			)}

			{activeModal === MODAL_TYPES.USER_RESPONSE && (
				<UserResponseModal
					isOpen={activeModal === MODAL_TYPES.USER_RESPONSE}
					onCloseAction={onCloseModal}
					data={modalData}
				/>
			)}

			{activeModal === MODAL_TYPES.CONFIRMATION && (
				<ConfirmationModal
					isOpen={activeModal === MODAL_TYPES.CONFIRMATION}
					onCloseAction={onCloseModal}
					data={modalData}
				/>
			)}

			{activeModal === MODAL_TYPES.COMPLETE && (
				<CompleteModal
					isOpen={activeModal === MODAL_TYPES.COMPLETE}
					onCloseAction={onCloseModal}
					data={modalData}
				/>
			)}
		</>
	);
}
