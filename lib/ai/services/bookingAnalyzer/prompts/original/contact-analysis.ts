/**
 * Prompt for AI-based contact detection and cleaning
 */
export const contactAnalysisPrompt = (text: string) =>
	`
Analyze the following message for contact information and clean it appropriately.

CONTACT INFORMATION INCLUDES:
- Phone numbers (any format)
- Email addresses
- Social media handles (@username, Instagram, Facebook, etc.)
- Messaging app usernames (WhatsApp, Telegram, Signal, Discord, Skype, etc.)
- Requests for direct contact ("call me", "text me", "message me", "contact me")
- Personal websites or URLs
- Any attempt to bypass the platform's communication system

MESSAGE TO ANALYZE:
"${text}"

CLEANING GUIDELINES:
- Remove all contact information completely
- Preserve the core service request and legitimate requirements
- Fix the grammar and spelling of the message
- Improve and enhance the message to be more professional and engaging
- Maintain the professional tone
- If the message is mostly contact info, replace with a generic professional request
- Do not leave placeholders like [REMOVED] or [CONTACT INFO]
- Ensure the cleaned message makes sense and is useful for service providers

Provide a thorough analysis and a clean, professional version of the message.
`.trim();
