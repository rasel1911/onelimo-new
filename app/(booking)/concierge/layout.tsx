import { Toaster } from "sonner";

import { ThemeProvider } from "@/components/custom/theme-provider";
import { Toaster as ShadcnToaster } from "@/components/ui/toaster";

const ConciergeLayout = ({ children }: { children: React.ReactNode }) => {
	return (
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
	);
};

export default ConciergeLayout;
