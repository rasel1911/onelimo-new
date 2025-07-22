import { Suspense } from "react";

import { PartnerRegistrationForm } from "@/app/(partners)/components/registration-form";
import { RegistrationFormSkeleton } from "@/app/(partners)/components/registration-form-skeleton";

interface PartnerRegistrationClientProps {
	initialEmail: string;
	token?: string;
	persistentLinkId?: string;
}

export const PartnerRegistrationClient = ({
	initialEmail,
	token,
	persistentLinkId,
}: PartnerRegistrationClientProps) => {
	return (
		<Suspense fallback={<RegistrationFormSkeleton />}>
			<PartnerRegistrationForm
				initialEmail={initialEmail}
				token={token}
				persistentLinkId={persistentLinkId}
			/>
		</Suspense>
	);
};
