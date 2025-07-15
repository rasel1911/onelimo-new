import Link from "next/link";

import { Button } from "@/components/ui/button";

const LocationNotFound = () => {
	return (
		<div className="flex min-h-[60vh] flex-col items-center justify-center">
			<h2 className="mb-4 text-2xl font-bold">Location Not Found</h2>
			<p className="mb-6 text-muted-foreground">
				The location you are looking for does not exist or has been removed.
			</p>
			<Link href="/admin/locations" passHref>
				<Button>Back to Locations</Button>
			</Link>
		</div>
	);
};

export default LocationNotFound;
