export const RESPONSE_ANALYZER_CONFIG = {
	TEMPERATURE: Number(process.env.RESPONSE_ANALYZER_TEMPERATURE ?? 0.4),
	MAX_TOKENS: Number(process.env.RESPONSE_ANALYZER_MAX_TOKENS ?? 15000),
	ANALYSIS_VERSION: "1.0.0",
	MAX_RETRIES: 3,
	RETRY_DELAY: 1000,
} as const;

export const SCORING_THRESHOLDS = {
	MIN_OVERALL_SCORE: 65,
	MIN_VIABILITY_SCORE: 60,
	MIN_SERIOUSNESS_SCORE: 55,
	MIN_PROFESSIONALISM_SCORE: 50,

	EXCELLENT_THRESHOLD: 85,
	GOOD_THRESHOLD: 70,
	FAIR_THRESHOLD: 55,
	POOR_THRESHOLD: 40,
} as const;

export const ANALYSIS_WEIGHTS = {
	VIABILITY_WEIGHT: 0.4,
	SERIOUSNESS_WEIGHT: 0.35,
	PROFESSIONALISM_WEIGHT: 0.25,
} as const;

export const RESPONSE_QUALITY_INDICATORS = {
	PROFESSIONAL_KEYWORDS: [
		"service",
		"professional",
		"quality",
		"experience",
		"luxury",
		"please",
		"thank",
		"appreciate",
		"happy",
		"provide",
		"ensure",
	],
	CONCERN_KEYWORDS: [
		"maybe",
		"might",
		"probably",
		"unsure",
		"not sure",
		"can't guarantee",
		"difficult",
		"problem",
		"issue",
		"concern",
		"worry",
	],
	POSITIVE_INDICATORS: [
		"confirm",
		"guarantee",
		"excellent",
		"premium",
		"reliable",
		"experienced",
		"specialise",
		"expert",
		"professional",
		"quality",
	],
} as const;

export const MARKET_ANALYSIS_THRESHOLDS = {
	HIGH_COMPETITION_THRESHOLD: 5,
	MODERATE_COMPETITION_THRESHOLD: 3,
	GOOD_RESPONSE_RATE: 0.7,
	EXCELLENT_RESPONSE_RATE: 0.85,
} as const;

export const DEFAULT_VALUES = {
	EMPTY_ANALYSIS: {
		id: "",
		providerId: "",
		bookingRequestId: "",
		workflowProviderId: "",
		providerName: "",
		overallScore: 0,
		viabilityScore: 0,
		seriousnessScore: 0,
		professionalismScore: 0,
		strengths: [] as string[],
		concerns: [] as string[],
		keyPoints: [] as string[],
		analysisNotes: "",
		isRecommended: false,
		recommendationReason: "",
		quoteAmount: 0,
		responseNote: "",
		status: "pending",
	},

	FALLBACK_SCORES: {
		VIABILITY: 50,
		SERIOUSNESS: 45,
		PROFESSIONALISM: 40,
	},
} as const;
