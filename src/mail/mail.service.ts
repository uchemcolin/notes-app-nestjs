import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import { ConfigService } from '@nestjs/config';

export interface EmailJobData {
  to: string;
  subject: string;
  html: string;
  name?: string;
}

@Injectable()
export class MailService {
  constructor(
    @InjectQueue('email') private emailQueue: Queue,
    private configService: ConfigService,       // inject config service
  ) {}

  async sendWelcomeEmail(to: string, name: string) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #4CAF50; color: white; padding: 20px; text-align: center;">
          <h1>Welcome ${name}!</h1>
        </div>
        <div style="padding: 20px;">
          <p>Thank you for joining Notes App!</p>
          <p>You can now:</p>
          <ul>
            <li>Create unlimited notes</li>
            <li>Organize your thoughts</li>
            <li>Access your notes from anywhere</li>
          </ul>
          <p>Get started by creating your first note!</p>
        </div>
        <div style="background-color: #f4f4f4; padding: 10px; text-align: center; font-size: 12px;">
          <p>© 2025 Notes App. All rights reserved.</p>
        </div>
      </div>
    `;

    // Add to queue instead of sending immediately
    const job = await this.emailQueue.add('send-welcome-email', {
      to,
      subject: `Welcome to Notes App, ${name}!`,
      html,
      name,
    }, {
      attempts: 3,                    // Retry 3 times if fails
      backoff: { type: 'exponential', delay: 5000 }, // Wait 5s, 10s, 20s
      removeOnComplete: true,         // Remove job after success
      removeOnFail: false,            // Keep failed jobs for debugging
    });

    return {
      success: true,
      message: 'Email queued successfully',
      jobId: job.id,
    };
  }

  async sendPasswordResetEmail(to: string, name: string, resetToken: string) {
    //const resetUrl = `http://localhost:3000/reset-password?token=${resetToken}`;
    //const resetUrl = `http://localhost:3000/auth/reset-password?token=${resetToken}`;

    const baseUrl = this.configService.get<string>('APP_BASE_URL');
    const resetUrl = `${baseUrl}/auth/reset-password?token=${resetToken}`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #ff9800; color: white; padding: 20px; text-align: center;">
          <h1>Password Reset Request</h1>
        </div>
        <div style="padding: 20px;">
          <p>Hello ${name},</p>
          <p>We received a request to reset your password. Click the button below to reset it:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #ff9800; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
              Reset Password
            </a>
          </div>
          <p>If you didn't request this, please ignore this email.</p>
          <p>This link will expire in 1 hour.</p>
        </div>
      </div>
    `;

    const job = await this.emailQueue.add('send-password-reset-email', {
      to,
      subject: 'Reset Your Password',
      html,
      name,
    }, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
      removeOnComplete: true,
    });

    return {
      success: true,
      message: 'Password reset email queued',
      jobId: job.id,
    };
  }

  async getQueueStats() {
    const [waiting, active, completed, failed] = await Promise.all([
      this.emailQueue.getWaitingCount(),
      this.emailQueue.getActiveCount(),
      this.emailQueue.getCompletedCount(),
      this.emailQueue.getFailedCount(),
    ]);

    return {
      waiting,
      active,
      completed,
      failed,
    };
  }

  async getFailedJobs() {
    const failedJobs = await this.emailQueue.getFailed();
    return failedJobs.map(job => ({
      id: job.id,
      data: job.data,
      failedReason: job.failedReason,
      attemptsMade: job.attemptsMade,
      timestamp: job.timestamp,
    }));
  }

  async retryFailedJob(jobId: string) {
    const job = await this.emailQueue.getJob(jobId);
    if (job) {
      await job.retry();
      return { success: true, message: 'Job retried' };
    }
    return { success: false, message: 'Job not found' };
  }
}