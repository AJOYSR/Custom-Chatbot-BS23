import { Global, Injectable } from '@nestjs/common';

import * as nodemailer from 'nodemailer';
import { mailConfig } from 'src/config/mail';

@Global()
@Injectable()
export class MailService {
  private readonly maxRetries: number = 3;
  emailTransport() {
    const transporter = nodemailer.createTransport({
      host: mailConfig.host,
      port: mailConfig.port,
      secure: false,
      auth: {
        user: mailConfig.user,
        pass: mailConfig.emailPassword,
      },
    });

    return transporter;
  }
  async sendMailWithRetry(
    email: string,
    subject: string,
    mailBody: string,
    retryCount = 1,
  ): Promise<boolean | null> {
    try {
      const data = {
        to: email,
        from: mailConfig.user,
        subject,
        html: mailBody,
      };
      const transport = this.emailTransport();

      await transport.sendMail(data);
      if (!transport) return false;
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
