import { Process, Processor } from '@nestjs/bull';
import type { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { EmailJobData } from './mail.service';

@Processor('email')
export class MailProcessor {
  private resend: Resend;
  private readonly logger = new Logger(MailProcessor.name);

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    this.resend = new Resend(apiKey);
  }

  @Process('send-welcome-email')
  async handleWelcomeEmail(job: Job<EmailJobData>) {
    const { data } = job;
    this.logger.log(`Processing welcome email job ${job.id} to ${data.to}`);

    const from = this.configService.get<string>('RESEND_FROM_EMAIL');

    if (!from) {
      throw new Error('RESEND_FROM_EMAIL is not defined');
    }

    try {
      const { error } = await this.resend.emails.send({
        //from: this.configService.get<string>('RESEND_FROM_EMAIL'),
        from,
        to: [data.to],
        subject: data.subject,
        html: data.html,
      });

      if (error) {
        this.logger.error(`Failed to send welcome email: ${error.message}`);
        throw new Error(error.message);
      }

      this.logger.log(`Welcome email sent successfully to ${data.to}`);
      return { success: true };
    } catch (error: unknown) {
      /*this.logger.error(`Error in welcome email job ${job.id}: ${error.message}`);
      throw error; // Will trigger retry*/

      const message =
        error instanceof Error
          ? error.message
          : 'Unknown error occurred';

      this.logger.error(
        `Error in welcome email job ${job.id}: ${message}`,
      );

      throw error;
    }
  }

  @Process('send-password-reset-email')
  async handlePasswordResetEmail(job: Job<EmailJobData>) {
    const { data } = job;
    this.logger.log(`Processing password reset email job ${job.id} to ${data.to}`);

    const from = this.configService.get<string>('RESEND_FROM_EMAIL');

    if (!from) {
      throw new Error('RESEND_FROM_EMAIL is not defined');
    }

    try {
      const { error } = await this.resend.emails.send({
        //from: this.configService.get<string>('RESEND_FROM_EMAIL'),
        from,
        to: [data.to],
        subject: data.subject,
        html: data.html,
      });

      if (error) {
        this.logger.error(`Failed to send password reset email: ${error.message}`);
        throw new Error(error.message);
      }

      this.logger.log(`Password reset email sent successfully to ${data.to}`);
      return { success: true };
    } catch (error: unknown) {
      /*this.logger.error(`Error in password reset email job ${job.id}: ${error.message}`);
      throw error;*/

      const message =
        error instanceof Error
          ? error.message
          : 'Unknown error occurred';

      this.logger.error(
        `Error in password reset email job ${job.id}: ${message}`,
      );

      throw error;
    }
  }
}