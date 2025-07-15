export interface QuoteLinkParams {
	bookingRequestId: string;
	workflowRunId: string;
	selectedQuoteIds: string[];
}

export interface QuoteHashData extends QuoteLinkParams {
	expiresAt: number;
}

export interface GeneratedQuoteLink {
	hash: string;
	url: string;
	expiresAt: Date;
	encryptedData: string;
}

export interface DecodedQuoteLink extends QuoteLinkParams {
	expiresAt: Date;
	isExpired: boolean;
}

export interface QuoteLinkData {
	hash: string;
	encryptedData: string;
	expiresAt: Date;
}
