import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { MailService } from './mail.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('mail')
@UseGuards(JwtAuthGuard)
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Get('stats')
  async getQueueStats() {
    return this.mailService.getQueueStats();
  }

  @Get('failed-jobs')
  async getFailedJobs() {
    return this.mailService.getFailedJobs();
  }

  @Post('retry/:jobId')
  async retryFailedJob(@Param('jobId') jobId: string) {
    return this.mailService.retryFailedJob(jobId);
  }

  @Post('test/:email')
  async testEmail(@Param('email') email: string) {
    return this.mailService.sendWelcomeEmail(email, 'Test User');
  }
}