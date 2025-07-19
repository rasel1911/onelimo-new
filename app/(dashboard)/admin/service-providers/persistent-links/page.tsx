import { ArrowLeft, Plus, RefreshCw } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

import { CreatePersistentLinkModal } from "@/app/(dashboard)/admin/components/create-persistent-link-modal";
import { Button } from "@/components/ui/button";

import { PersistentLinksList } from "./components/persistent-links-list";
import PersistentLinksLoading from "./loading";

const PersistentLinksPage = () => {
	return (
		<div className="container py-8">
			<div className="mb-6">
				<Link href="/admin/service-providers" passHref>
					<Button variant="outline" size="sm" className="mb-4">
						<ArrowLeft className="mr-2 size-4" />
						Back to Service Providers
					</Button>
				</Link>
				<div className="flex flex-col md:flex-row md:items-center md:justify-between">
					<div>
						<h1 className="text-3xl font-bold tracking-tight">Persistent Registration Links</h1>
						<p className="text-muted-foreground">
							Manage permanent links for service provider registration that never expire
						</p>
					</div>
					<div className="mt-4 flex gap-2 md:mt-0">
						<Button variant="ghost" disabled>
							<RefreshCw className="mr-2 size-4" />
							Refresh
						</Button>
						<CreatePersistentLinkModal
							trigger={
								<Button>
									<Plus className="mr-2 size-4" />
									Create Link
								</Button>
							}
						/>
					</div>
				</div>
			</div>

			<Suspense fallback={<PersistentLinksLoading />}>
				<PersistentLinksList />
			</Suspense>
		</div>
	);
};

export default PersistentLinksPage;
