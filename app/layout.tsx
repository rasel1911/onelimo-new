import { StagewiseToolbar } from "@stagewise/toolbar-next";
import { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";

import { ThemeProvider } from "@/components/custom/theme-provider";
import { Toaster as ShadcnToaster } from "@/components/ui/toaster";

import "./globals.css";

export const metadata: Metadata = {
	metadataBase: new URL("https://onelimo.vercel.ai"),
	title: "Onelimo AI Conceirge",
	description: "Book a ride with Onelimo AI",
};

const stagewiseConfig = {
	plugins: [],
};

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className="antialiased">
				<SessionProvider>
					<ThemeProvider
						attribute="class"
						defaultTheme="system"
						enableSystem
						disableTransitionOnChange
					>
						<Toaster position="top-center" />
						<ShadcnToaster />
						{children}
						{process.env.NODE_ENV === "development" && (
							<StagewiseToolbar config={stagewiseConfig} />
						)}
					</ThemeProvider>
				</SessionProvider>
			</body>
		</html>
	);
}
