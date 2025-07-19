/**
 * Generate the full URL for a persistent link
 * @param linkId - The ID of the link to generate the URL for
 * @returns The full URL for the persistent link
 */
export const generatePersistentLinkUrl = (linkId: string): string => {
	const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
	return `${baseUrl}/partner-registration?ref=${linkId}`;
};
