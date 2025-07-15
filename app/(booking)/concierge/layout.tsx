import { Toaster } from "sonner";

import { ThemeProvider } from "@/components/custom/theme-provider";
import { Toaster as ShadcnToaster } from "@/components/ui/toaster";

export default function AgentLayout({ children }: { children: React.ReactNode }) {
	return (
		<ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
			<Toaster position="top-center" />
			<ShadcnToaster />
			{children}
		</ThemeProvider>
	);
}
