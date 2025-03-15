import { Global, Injectable } from '@nestjs/common';

import * as sendgrid from '@sendgrid/mail';
import { mailConfig } from 'src/config/mail';
sendgrid.setApiKey(mailConfig.apiKey);

@Global()
@Injectable()
export class MailService {
  private readonly maxRetries: number = 3;

  async sendMailWithRetry(
    email: string,
    subject: string,
    mailBody: string,
    retryCount = 1,
  ): Promise<boolean | null> {
    try {
      const data = {
        to: email,
        from: 'hello@longshotcameras.com',
        subject,
        html: mailBody,
      };

      const res = await sendgrid.send(data);

      if (!res) return false;
      return true;
    } catch (error) {
      console.log('sendMail err: ', JSON.stringify(error, null, 2));

      // Retry logic
      if (retryCount < this.maxRetries) {
        return this.sendMailWithRetry(email, subject, mailBody, retryCount + 1);
      }

      // If max retries reached, return null
      return null;
    }
  }

  async sendMail(
    email: string,
    subject: string,
    mailBody: string,
  ): Promise<boolean | null> {
    // Start with the first attempt (retryCount = 1)
    return await this.sendMailWithRetry(email, subject, mailBody);
  }
}
