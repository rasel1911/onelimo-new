import { redirect } from "next/navigation";

import { PartnerRegistrationClient } from "@/app/(partners)/components/registration-client";
import { validateToken } from "@/db/queries/registrationToken.queries";

export default async function PartnerRegistrationPage({
	searchParams,
}: {
	searchParams: { token?: string; email?: string };
}) {
	const token = searchParams.token;
	const email = searchParams.email;

	if (!token) {
		redirect("/");
	}

	const validation = await validateToken(token);

	if (!validation.isValid) {
		redirect("/");
	}

	return <PartnerRegistrationClient initialEmail={email || ""} token={token} />;
}
