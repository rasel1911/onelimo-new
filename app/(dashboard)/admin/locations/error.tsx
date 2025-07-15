"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

const LocationsError = ({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) => {
	useEffect(() => {
		console.error(error);
	}, [error]);

	return (
		<div className="flex min-h-screen flex-col items-center justify-center">
			<h2 className="mb-4 text-2xl font-bold">Something went wrong!</h2>
			<Button onClick={() => reset()}>Try again</Button>
		</div>
	);
};

export default LocationsError;
