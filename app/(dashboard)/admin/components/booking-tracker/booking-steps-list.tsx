import { BookingStepsListProps } from "@/lib/workflow/types/booking-tracker";

import { BookingStep } from "./booking-step";

export function BookingStepsList({ steps, selectedBooking, onModalOpen }: BookingStepsListProps) {
	return (
		<div className="relative mt-8">
			<div className="absolute inset-y-0 left-6 w-0.5 bg-slate-200 dark:bg-slate-700" />

			<div className="space-y-8">
				{steps.map((step) => (
					<BookingStep
						key={step.id}
						step={step}
						selectedBooking={selectedBooking}
						onModalOpen={onModalOpen}
					/>
				))}
			</div>
		</div>
	);
}
