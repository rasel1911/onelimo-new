"use client";

import { ReactNode } from "react";

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "@/components/ui/dialog";

interface BaseModalProps {
	isOpen: boolean;
	onCloseAction: () => void;
	title: string;
	description?: string;
	icon?: ReactNode;
	children: ReactNode;
	maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl";
	maxHeight?: string;
}

export function BaseModal({
	isOpen,
	onCloseAction,
	title,
	description,
	icon,
	children,
	maxWidth = "4xl",
	maxHeight = "90vh",
}: BaseModalProps) {
	const maxWidthClasses = {
		sm: "sm:max-w-sm",
		md: "sm:max-w-md",
		lg: "sm:max-w-lg",
		xl: "sm:max-w-xl",
		"2xl": "sm:max-w-2xl",
		"3xl": "sm:max-w-3xl",
		"4xl": "sm:max-w-4xl",
		"5xl": "sm:max-w-5xl",
		"6xl": "sm:max-w-6xl",
		"7xl": "sm:max-w-7xl",
	};

	return (
		<Dialog open={isOpen} onOpenChange={onCloseAction}>
			<DialogContent
				className={`${maxWidthClasses[maxWidth]} overflow-y-auto`}
				style={{ maxHeight }}
			>
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						{icon}
						{title}
					</DialogTitle>
					{description && <DialogDescription>{description}</DialogDescription>}
				</DialogHeader>
				{children}
			</DialogContent>
		</Dialog>
	);
}
