import { PartnerRegistrationForm } from "@/app/(partners)/components/registration-form";

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
		<PartnerRegistrationForm
			initialEmail={initialEmail}
			token={token}
			persistentLinkId={persistentLinkId}
		/>
	);
};
