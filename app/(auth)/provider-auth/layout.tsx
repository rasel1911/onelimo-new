import { Metadata } from "next";

export const metadata: Metadata = {
	title: "Provider Authentication - Onelimo",
	description: "Secure authentication for service providers",
};

export default function ProviderAuthLayout({ children }: { children: React.ReactNode }) {
	return <div className="min-h-screen bg-background">{children}</div>;
}
