import { redirect } from "next/navigation";

import { PartnerRegistrationClient } from "@/app/(partners)/components/registration-client";
import { validatePersistentLink } from "@/db/queries/persistentRegistrationLink.queries";
import { validateToken } from "@/db/queries/registrationToken.queries";

const PartnerRegistrationPage = async ({
	searchParams,
}: {
	searchParams: { token?: string; email?: string; ref?: string };
}) => {
	const token = searchParams.token;
	const email = searchParams.email;
	const persistentLinkId = searchParams.ref;

	if (!token && !persistentLinkId) {
		redirect("/");
	}

	if (token) {
		const validation = await validateToken(token);
		if (!validation.isValid) {
			redirect("/");
		}
	}

	if (persistentLinkId) {
		const validation = await validatePersistentLink(persistentLinkId);
		if (!validation.isValid) {
			redirect("/");
		}
	}

	return (
		<PartnerRegistrationClient
			initialEmail={email || ""}
			token={token}
			persistentLinkId={persistentLinkId}
		/>
	);
};

export default PartnerRegistrationPage;
