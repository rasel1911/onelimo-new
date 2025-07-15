import twilio from "twilio";

interface TwilioConfig {
	accountSid: string;
	authToken: string;
	fromNumber: string;
}

export class TwilioService {
	private client: twilio.Twilio;
	private config: TwilioConfig;

	constructor(config: TwilioConfig) {
		this.config = config;
		this.client = twilio(config.accountSid, config.authToken);
	}

	async sendSMS(to: string, message: string) {
		try {
			const result = await this.client.messages.create({
				body: message,
				to,
				from: this.config.fromNumber,
			});
			return { success: true, sid: result.sid, status: result.status };
		} catch (error) {
			console.error("Error sending SMS:", error);
			return { success: false, error };
		}
	}

	async getMessageStatus(messageSid: string) {
		try {
			const message = await this.client.messages(messageSid).fetch();
			return { success: true, status: message.status };
		} catch (error) {
			console.error("Error getting message status:", error);
			return { success: false, error };
		}
	}
}

export const twilioConfig: TwilioConfig = {
	accountSid: process.env.TWILIO_ACCOUNT_SID!,
	authToken: process.env.TWILIO_AUTH_TOKEN!,
	fromNumber: process.env.TWILIO_FROM_NUMBER!,
};

export const twilioService = new TwilioService(twilioConfig);
