export interface BaseModalData {
	id?: string;
	title?: string;
	description?: string;
}

export interface BookingModalData extends BaseModalData {
	bookingRequest: any;
	message?: string;
	contact?: string;
}

export interface MessageModalData extends BaseModalData {
	original?: string;
	improved?: string;
	analysis?: any;
	step?: any;
}

export interface ModalProps<T = any> {
	isOpen: boolean;
	onCloseAction: () => void;
	data: T;
}
