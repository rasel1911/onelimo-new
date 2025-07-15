import {
	Body,
	Button,
	Container,
	Head,
	Heading,
	Hr,
	Html,
	Link,
	Preview,
	Section,
	Text,
} from "@react-email/components";
import * as React from "react";

interface PartnerInvitationProps {
	partnerEmail: string;
	registrationUrl: string;
	expiresInHours?: number;
}

export const PartnerInvitationEmail = ({
	partnerEmail,
	registrationUrl,
	expiresInHours = 48,
}: PartnerInvitationProps) => {
	const fullUrl = registrationUrl.startsWith("http")
		? registrationUrl
		: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}${registrationUrl}`;

	const cleanUrl = fullUrl.replace(/https?:\/\/\w+\.resend-links\.com\/\w+\//, "");

	return (
		<Html>
			<Head />
			<Preview>You&apos;ve been invited to join Onelimo as a partner</Preview>
			<Body style={main}>
				<Container style={container}>
					<Heading style={h1}>Partner Invitation</Heading>
					<Text style={text}>
						You&apos;ve been invited to join the Onelimo platform as a service partner. Complete
						your registration to start offering your services through our platform.
					</Text>

					<Section style={buttonContainer}>
						<Button style={{ ...button, padding: "12px 20px" }} href={cleanUrl}>
							Complete Registration
						</Button>
					</Section>

					<Text style={text}>
						This invitation link will expire in {expiresInHours} hours. If you need a new invitation
						or have any questions, please contact our partner support team.
					</Text>

					<Text style={text}>
						Or copy and paste this URL into your browser:
						<br />
						<Link href={cleanUrl} style={link} target="_blank" rel="noopener noreferrer">
							{cleanUrl}
						</Link>
					</Text>

					<Hr style={hr} />

					<Text style={footer}>
						This invitation was sent to {partnerEmail}. If you did not request this invitation, you
						can safely ignore this email.
					</Text>

					<Text style={footer}>
						© {new Date().getFullYear()} Onelimo, Inc. All rights reserved.
					</Text>
				</Container>
			</Body>
		</Html>
	);
};

// Styles
const main = {
	backgroundColor: "#f6f9fc",
	fontFamily:
		'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif',
};

const container = {
	backgroundColor: "#ffffff",
	margin: "0 auto",
	padding: "24px",
	borderRadius: "12px",
	maxWidth: "600px",
};

const logo = {
	margin: "0 auto 24px",
	display: "block",
};

const h1 = {
	color: "#333",
	fontFamily:
		'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif',
	fontSize: "24px",
	fontWeight: "bold",
	margin: "32px 0",
	textAlign: "center" as const,
};

const text = {
	color: "#444",
	fontSize: "16px",
	lineHeight: "24px",
	margin: "16px 0",
};

const buttonContainer = {
	margin: "32px 0",
	textAlign: "center" as const,
};

const button = {
	backgroundColor: "#5271FF",
	borderRadius: "4px",
	color: "#fff",
	fontSize: "16px",
	fontWeight: "bold",
	textDecoration: "none",
	textTransform: "none" as const,
	display: "inline-block",
};

const hr = {
	borderColor: "#e6ebf1",
	margin: "32px 0",
};

const footer = {
	color: "#8898aa",
	fontSize: "12px",
	lineHeight: "20px",
	margin: "8px 0",
};

const link = {
	color: "#5271FF",
	fontSize: "14px",
	textDecoration: "underline",
};

export default PartnerInvitationEmail;
