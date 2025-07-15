"use server";

import { z } from "zod";

import { createRegistrationToken } from "@/db/queries/registrationToken.queries";
import { sendEmail as sendEmailService } from "@/lib/email";
import { renderEmailTemplate } from "@/lib/email/render";
import { PartnerInvitationEmail } from "@/lib/email/templates/partner-invitation";

const InvitePartnerSchema = z.object({
	email: z
		.string()
		.email("Invalid email address")
		.refine((email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email), {
			message: "Please enter a valid email address",
		}),
	sendEmail: z.boolean().optional().default(true),
});

export type InvitePartnerFormData = z.infer<typeof InvitePartnerSchema>;

/**
 * Generate and send a partner registration invitation
 * @param formData The invitation form data
 * @param sendEmailFlag Whether to send an email (default: true)
 * @returns Success status and token if requested
 */
export const invitePartner = async (formData: { email: string }, sendEmailFlag: boolean = true) => {
	try {
		const validatedFields = InvitePartnerSchema.safeParse({
			email: formData.email,
			sendEmail: sendEmailFlag,
		});

		if (!validatedFields.success) {
			return {
				success: false,
				error: validatedFields.error.flatten().fieldErrors,
			};
		}

		const email = validatedFields.data.email;

		const { token } = await createRegistrationToken(email, 48);

		const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
		const registrationUrl = `${baseUrl}/partner-registration?token=${token}&email=${encodeURIComponent(email)}`;

		const cleanUrl = registrationUrl.replace(/https?:\/\/\w+\.resend-links\.com\/\w+\//, "");

		if (validatedFields.data.sendEmail) {
			try {
				const emailHtml = await renderEmailTemplate(PartnerInvitationEmail, {
					partnerEmail: email,
					registrationUrl: cleanUrl,
					expiresInHours: 48,
				});

				// Generate plain text version
				const plainText = `
          You've been invited to join Onelimo as a partner.
          
          Complete your registration by visiting this link:
          ${cleanUrl}
          
          This invitation link will expire in 48 hours.
          
          If you did not request this invitation, you can safely ignore this email.
        `;

				await sendEmailService({
					to: email,
					template: {
						subject: "Onelimo Partner Registration Invitation",
						text: plainText,
						html: emailHtml,
					},
				});
			} catch (templateError) {
				console.error("Error rendering email template:", templateError);

				const fallbackHtml = `
          <!DOCTYPE html>
          <html>
            <head>
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Partner Invitation</title>
              <style>
                body { 
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                  background-color: #f6f9fc;
                  margin: 0;
                  padding: 20px;
                }
                .container {
                  max-width: 600px;
                  margin: 0 auto;
                  background-color: #ffffff;
                  border-radius: 8px;
                  padding: 30px;
                }
                .button {
                  display: inline-block;
                  background-color: #5271FF;
                  color: #ffffff !important;
                  text-decoration: none;
                  padding: 12px 25px;
                  border-radius: 4px;
                  font-weight: bold;
                  margin: 20px 0;
                }
                .footer {
                  font-size: 12px;
                  color: #8898aa;
                  margin-top: 30px;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <h1>Partner Invitation</h1>
                <p>You've been invited to join the Onelimo platform as a service partner.</p>
                <p>Complete your registration to start offering your services through our platform.</p>
                <a href="${cleanUrl}" class="button">Complete Registration</a>
                <p>Or copy and paste this URL into your browser: <br>${cleanUrl}</p>
                <p>This invitation link will expire in 48 hours.</p>
                <div class="footer">
                  <p>This invitation was sent to ${email}.</p>
                  <p>If you did not request this invitation, you can safely ignore this email.</p>
                  <p>© ${new Date().getFullYear()} Onelimo, Inc. All rights reserved.</p>
                </div>
              </div>
            </body>
          </html>
        `;

				const plainText = `
          You've been invited to join Onelimo as a partner.
          
          Complete your registration by visiting this link:
          ${cleanUrl}
          
          This invitation link will expire in 48 hours.
          
          If you did not request this invitation, you can safely ignore this email.
        `;

				await sendEmailService({
					to: email,
					template: {
						subject: "Onelimo Partner Registration Invitation",
						text: plainText,
						html: fallbackHtml,
					},
				});
			}

			return {
				success: true,
			};
		}

		return {
			success: true,
			token,
			registrationUrl: cleanUrl,
		};
	} catch (error) {
		console.error("Error inviting partner:", error);
		return {
			success: false,
			error: "Failed to send invitation. Please try again later.",
		};
	}
};
