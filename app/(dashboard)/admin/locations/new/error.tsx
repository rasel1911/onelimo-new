"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";

const NewLocationError = ({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) => {
	const router = useRouter();

	useEffect(() => {
		console.error(error);
	}, [error]);

	return (
		<div className="flex min-h-[60vh] flex-col items-center justify-center">
			<h2 className="mb-4 text-2xl font-bold">Something went wrong!</h2>
			<p className="mb-6 text-muted-foreground">There was an error creating the new location.</p>
			<div className="flex gap-4">
				<Button variant="outline" onClick={() => router.push("/admin/locations")}>
					Back to Locations
				</Button>
				<Button onClick={() => reset()}>Try again</Button>
			</div>
		</div>
	);
};

export default NewLocationError;
