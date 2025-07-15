import { PIN_RESET_TOKEN_EXPIRY_HOURS } from "@/lib/utils/pin-utils";

export const createResetEmailHtml = (providerName: string, resetUrl: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>PIN Reset Request</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px; }
    .content { padding: 20px 0; }
    .button { display: inline-block; background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; }
    .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 4px; margin: 20px 0; }
    .footer { font-size: 12px; color: #666; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>PIN Reset Request</h1>
    </div>
    
    <div class="content">
      <p>Hello ${providerName},</p>
      
      <p>We received a request to reset your PIN for your Onelimo provider account. If you made this request, please click the button below to reset your PIN:</p>
      
      <p style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" class="button">Reset My PIN</a>
      </p>
      
      <div class="warning">
        <h3>Security Information:</h3>
        <ul>
          <li>This link will expire in ${PIN_RESET_TOKEN_EXPIRY_HOURS} hours</li>
          <li>This link can only be used once</li>
          <li>If you didn't request this reset, please ignore this email</li>
          <li>Your current PIN will remain active until you complete the reset</li>
        </ul>
      </div>
      
      <p>If you're having trouble clicking the button, you can copy and paste this URL into your browser:</p>
      <p style="word-break: break-all; color: #666; font-size: 14px;">${resetUrl}</p>
      
      <p>If you didn't request this PIN reset, please ignore this email. Your PIN will remain unchanged.</p>
    </div>
    
    <div class="footer">
      <p>This is an automated email from Onelimo. Please do not reply to this email.</p>
      <p>If you need assistance, please contact our support team.</p>
    </div>
  </div>
</body>
</html>
`;

export const createResetEmailText = (
	providerName: string,
	resetUrl: string,
) => `Hello ${providerName},

We received a request to reset your PIN for your Onelimo provider account.

Reset your PIN: ${resetUrl}

This link will expire in ${PIN_RESET_TOKEN_EXPIRY_HOURS} hours and can only be used once.

If you didn't request this reset, please ignore this email.

Onelimo Team`;
