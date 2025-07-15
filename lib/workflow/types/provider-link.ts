export interface ProviderLinkParams {
	bookingRequestId: string;
	providerId: string;
	workflowProviderId: string;
	workflowRunId?: string;
}

export interface HashData extends ProviderLinkParams {
	expiresAt: number;
}

export interface GeneratedProviderLink {
	hash: string;
	url: string;
	expiresAt: Date;
	encryptedData: string;
}

export interface DecodedProviderLink extends ProviderLinkParams {
	expiresAt: Date;
	isExpired: boolean;
}
