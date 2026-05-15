import { Injectable, BadRequestException, UnauthorizedException, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { MailService } from '../mail/mail.service';
import { randomBytes } from 'crypto'; // ✅ Import Node crypto

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  // ---------- SIGNUP ----------
  async signup(signupDto: SignupDto) {
    try {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: signupDto.email },
      });

      if (existingUser) {
        throw new ConflictException({
          message: 'Email already registered',
          error: 'Conflict',
          field: 'email',
        });
      }

      const hashedPassword = await bcrypt.hash(signupDto.password, 10);

      const user = await this.prisma.user.create({
        data: {
          firstName: signupDto.firstName,
          middleName: signupDto.middleName,
          lastName: signupDto.lastName,
          email: signupDto.email,
          password: hashedPassword,
        },
      });

      // Queue the welcome email (non-blocking)
      // This runs in background, doesn't slow down the response
      this.mailService.sendWelcomeEmail(user.email, user.firstName)
        .then(result => {
          console.log(`Email queued: ${result.jobId}`);
        })
        .catch(error => {
          console.error(`Failed to queue email: ${error.message}`);
        });

      const token = this.generateToken(user.id, user.email);
      
      return {
        success: true,
        message: 'User registered successfully. Welcome email will be sent shortly!',
        data: {
          user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
          },
          access_token: token.access_token,
        },
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException({
        message: 'Failed to create user',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    }
  }

  // ---------- LOGIN ----------
  async login(loginDto: LoginDto) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email: loginDto.email },
      });

      if (!user) {
        throw new UnauthorizedException({
          message: 'Invalid email or password',
          error: 'Unauthorized',
        });
      }

      const passwordMatches = await bcrypt.compare(loginDto.password, user.password);

      if (!passwordMatches) {
        throw new UnauthorizedException({
          message: 'Invalid email or password',
          error: 'Unauthorized',
        });
      }

      const token = this.generateToken(user.id, user.email);
      
      return {
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
          },
          access_token: token.access_token,
        },
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new BadRequestException({
        message: 'Login failed',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    }
  }

  // ---------- FORGOT PASSWORD ----------
  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new NotFoundException('User with this email does not exist');

    // Generate token (we’ll hash it before storing)
    const resetToken = randomBytes(32).toString('hex');
    const tokenHash = await bcrypt.hash(resetToken, 10);

    // Save to PasswordResetToken table
    const expiresAt = new Date(Date.now() + 3600 * 1000); // 1 hour expiry
    await this.prisma.passwordResetToken.create({
      data: { userId: user.id, tokenHash, expiresAt },
    });

    // Send email with raw token (client will use it)
    await this.mailService.sendPasswordResetEmail(user.email, user.firstName, resetToken);

    return { success: true, message: 'Password reset email sent' };
  }

  // ---------- RESET PASSWORD ----------
  async resetPassword(token: string, newPassword: string) {
    const resetTokens = await this.prisma.passwordResetToken.findMany({
      where: { usedAt: null },
      include: { user: true },
    });

    // Proper type declaration for matchedToken
    let matchedToken: typeof resetTokens[number] | null = null;

    for (const t of resetTokens) {
      if (await bcrypt.compare(token, t.tokenHash)) {
        matchedToken = t;
        break;
      }
    }

    if (!matchedToken) throw new BadRequestException('Invalid or expired token');

    if (matchedToken.expiresAt < new Date()) throw new BadRequestException('Token has expired');

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({ where: { id: matchedToken.userId }, data: { password: hashedPassword } });

    await this.prisma.passwordResetToken.update({ where: { id: matchedToken.id }, data: { usedAt: new Date() } });

    return { success: true, message: 'Password reset successfully' };
  }

  // ---------- HELPER ----------
  private generateToken(userId: number, email: string) {
    const payload = { sub: userId, email };
    return { access_token: this.jwtService.sign(payload) };
  }
}