"use client";

import { motion } from "framer-motion";
import { Car } from "lucide-react";
import { memo } from "react";

import { EmptyStateProps } from "../../types";

const EmptyStateComponent = ({ isVisible }: EmptyStateProps) => {
	if (!isVisible) return null;

	return (
		<motion.div
			initial={{ opacity: 0, scale: 0.8 }}
			animate={{ opacity: 1, scale: 1 }}
			transition={{ delay: 0.25, type: "spring" }}
			className="absolute inset-0 flex flex-col items-center justify-center space-y-6 p-8 text-center"
		>
			<div className="space-y-4">
				<div className="mx-auto flex size-20 items-center justify-center rounded-full bg-primary/10">
					<Car className="size-10 text-primary" />
				</div>
				<h2 className="text-3xl font-bold text-primary">Luxury Car Booking</h2>
				<p className="max-w-2xl pb-2 text-lg text-muted-foreground">
					Start chatting with our concierge to book your luxury vehicle. Your booking details will
					appear here as you provide information.
				</p>
			</div>
		</motion.div>
	);
};

export const EmptyState = memo(EmptyStateComponent);
