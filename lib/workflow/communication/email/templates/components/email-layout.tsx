import { Html, Head, Preview, Body, Container, Font } from "@react-email/components";
import { Tailwind } from "@react-email/tailwind";
import React from "react";

interface EmailLayoutProps {
	children: React.ReactNode;
	previewText: string;
}

const tailwindConfig = {
	theme: {
		extend: {
			colors: {
				primary: "#2563EB",
				secondary: "#1F2937",
				success: "#059669",
				danger: "#DC2626",
				warning: "#D97706",
				gray: {
					50: "#F9FAFB",
					100: "#F3F4F6",
					200: "#E5E7EB",
					300: "#D1D5DB",
					400: "#9CA3AF",
					500: "#6B7280",
					600: "#4B5563",
					700: "#374151",
					800: "#1F2937",
					900: "#111827",
				},
				blue: {
					50: "#EFF6FF",
					100: "#DBEAFE",
					500: "#3B82F6",
					600: "#2563EB",
				},
				green: {
					50: "#F0FDF4",
					100: "#DCFCE7",
					500: "#22C55E",
					600: "#16A34A",
				},
				red: {
					50: "#FEF2F2",
					100: "#FEE2E2",
					500: "#EF4444",
					600: "#DC2626",
				},
				orange: {
					50: "#FFF7ED",
					100: "#FFEDD5",
					500: "#F97316",
					600: "#EA580C",
				},
			},
			fontFamily: {
				sans: ["Inter", "system-ui", "sans-serif"],
			},
		},
	},
};

const EmailLayout: React.FC<EmailLayoutProps> = ({ children, previewText }) => {
	return (
		<Html>
			<Head>
				<Font
					fontFamily="Inter"
					fallbackFontFamily="Arial"
					webFont={{
						url: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap",
						format: "woff2",
					}}
					fontWeight={400}
					fontStyle="normal"
				/>
			</Head>
			<Preview>{previewText}</Preview>
			<Tailwind config={tailwindConfig}>
				<Body
					style={{
						backgroundColor: "#F9FAFB",
						fontFamily: "Inter, Arial, sans-serif",
					}}
				>
					<Container style={{ maxWidth: "600px", margin: "0 auto", padding: "16px 8px" }}>
						{children}
					</Container>
				</Body>
			</Tailwind>
		</Html>
	);
};

export default EmailLayout;
