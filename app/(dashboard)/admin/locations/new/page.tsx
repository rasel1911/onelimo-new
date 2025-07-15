import { Suspense } from "react";

import { LocationForm } from "@/app/(dashboard)/admin/components/location-form";
import LocationFormSkeleton from "@/app/(dashboard)/admin/components/location-form-skeleton";

const NewLocationPage = () => {
	return (
		<div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center">
			<Suspense fallback={<LocationFormSkeleton />}>
				<LocationForm mode="create" />
			</Suspense>
		</div>
	);
};

export default NewLocationPage;
