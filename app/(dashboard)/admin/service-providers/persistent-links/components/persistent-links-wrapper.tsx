"use client";

import { useTransition } from "react";

import { PersistentRegistrationLink } from "@/db/schema";

import { PersistentLinksClient } from "./persistent-links-client";

interface PersistentLinksWrapperProps {
	initialLinks: PersistentRegistrationLink[];
}

export function PersistentLinksWrapper({ initialLinks }: PersistentLinksWrapperProps) {
	const [isPending, startTransition] = useTransition();

	return (
		<div className={isPending ? "opacity-50 transition-opacity" : ""}>
			<PersistentLinksClient initialLinks={initialLinks} />
		</div>
	);
}
