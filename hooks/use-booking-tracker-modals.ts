import { useState } from "react";

import { ModalState, ModalActions } from "@/lib/workflow/types/booking-tracker";

interface UseBookingTrackerModalsReturn extends ModalState, ModalActions {}

export const useBookingTrackerModals = (): UseBookingTrackerModalsReturn => {
	const [activeModal, setActiveModal] = useState<string | null>(null);
	const [modalData, setModalData] = useState<any>(null);

	const openModal = (type: string, data: any) => {
		setActiveModal(type);
		setModalData(data);
	};

	const closeModal = () => {
		setActiveModal(null);
		setModalData(null);
	};

	return {
		activeModal,
		modalData,
		openModal,
		closeModal,
	};
};
