"use client";

import { PartnerRegistrationForm } from "@/app/(partners)/components/registration-form";

interface PartnerRegistrationClientProps {
	initialEmail: string;
	token: string;
}

export function PartnerRegistrationClient({ initialEmail, token }: PartnerRegistrationClientProps) {
	return <PartnerRegistrationForm initialEmail={initialEmail} token={token} />;
}
