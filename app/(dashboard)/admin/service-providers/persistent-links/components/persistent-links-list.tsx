import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getPersistentLinks } from "@/db/queries/persistentRegistrationLink.queries";

import { PersistentLinksWrapper } from "./persistent-links-wrapper";

export const PersistentLinksList = async () => {
	const links = await getPersistentLinks();

	return (
		<Card>
			<CardHeader>
				<CardTitle>Persistent Links</CardTitle>
				<CardDescription>
					These links never expire and can be shared across multiple communication channels.
				</CardDescription>
			</CardHeader>
			<CardContent>
				{links.length === 0 ? (
					<div className="flex flex-col items-center justify-center py-8 text-center">
						<p className="text-muted-foreground">No persistent links found.</p>
						<p className="mt-2 text-sm text-muted-foreground">
							Create your first persistent link to get started.
						</p>
					</div>
				) : (
					<PersistentLinksWrapper initialLinks={links} />
				)}
			</CardContent>
		</Card>
	);
};
