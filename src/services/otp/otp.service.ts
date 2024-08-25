import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { Twilio } from 'twilio';

@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);
  private readonly client: Twilio;

  constructor() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

    if (!accountSid || !authToken || !verifyServiceSid) {
      throw new Error('Twilio credentials or Verify Service SID are missing');
    }

    this.client = new Twilio(accountSid, authToken);
  }

  async sendOtp(phoneNumber: string): Promise<void> {
    try {
      const verification = await this.client.verify.v2
        .services(process.env.TWILIO_VERIFY_SERVICE_SID)
        .verifications.create({
          to: phoneNumber,
          channel: 'sms',
        });

      this.logger.log(`OTP sent to ${phoneNumber}: ${verification.status}`);
    } catch (error) {
      this.logger.error(`Failed to send OTP to ${phoneNumber}`, error.stack);
      throw new BadRequestException('Failed to send OTP');
    }
  }

  async verifyOtp(phoneNumber: string, code: string): Promise<boolean> {
    try {
      const verificationCheck = await this.client.verify.v2
        .services(process.env.TWILIO_VERIFY_SERVICE_SID)
        .verificationChecks.create({
          to: phoneNumber,
          code: code,
        });

      return verificationCheck.status === 'approved';
    } catch (error) {
      this.logger.error(`Failed to verify OTP for ${phoneNumber}`, error.stack);
      throw new BadRequestException('Failed to verify OTP');
    }
  }
}
