"use client";

import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
	icon: LucideIcon;
	title: string;
	description?: string;
}

export function EmptyState({ icon: Icon, title, description }: EmptyStateProps) {
	return (
		<div className="flex flex-col items-center justify-center py-12 text-center">
			<Icon className="mb-4 size-12 text-muted-foreground" />
			<p className="text-muted-foreground">{title}</p>
			{description && <p className="mt-2 text-sm text-muted-foreground">{description}</p>}
		</div>
	);
}
