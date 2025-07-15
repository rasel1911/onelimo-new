import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
const resend = new Resend(resendApiKey);
const DEFAULT_FROM_EMAIL = process.env.DEFAULT_FROM_EMAIL || "notifications@onelimo.co.uk";

export interface EmailTemplate {
	subject: string;
	html: string;
	text: string;
}

/**
 * Send an email using Resend
 *
 * @param to - Recipient email address
 * @param template - Email template containing subject, HTML and text content
 * @param from - Sender email address (optional, uses default if not provided)
 * @returns Promise with the send result
 */
export async function sendEmail({
	to,
	template,
	from = DEFAULT_FROM_EMAIL,
}: {
	to: string;
	template: EmailTemplate;
	from?: string;
}) {
	try {
		if (!resendApiKey) {
			console.error("RESEND_API_KEY is not defined");
			throw new Error("Email service is not configured properly");
		}

		const result = await resend.emails.send({
			from,
			to,
			subject: template.subject,
			html: template.html,
			text: template.text,
		});

		return { success: true, data: result };
	} catch (error) {
		console.error("Failed to send email:", error);
		return { success: false, error };
	}
}
