import { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";

import { ThemeProvider } from "@/components/custom/theme-provider";
import { Toaster as ShadcnToaster } from "@/components/ui/toaster";
import { QueryProvider } from "@/lib/utils/query-client-provider";

import "./globals.css";

export const metadata: Metadata = {
	metadataBase: new URL("https://onelimo.vercel.ai"),
	title: "Onelimo AI Conceirge",
	description: "Book a ride with Onelimo AI",
};

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" className="dark">
			<body className="antialiased">
				<SessionProvider>
					<QueryProvider>
						<ThemeProvider
							attribute="class"
							defaultTheme="dark"
							enableSystem={false}
							disableTransitionOnChange
						>
							<Toaster position="top-center" />
							<ShadcnToaster />
							{children}
						</ThemeProvider>
					</QueryProvider>
				</SessionProvider>
			</body>
		</html>
	);
}
