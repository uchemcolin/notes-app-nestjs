/*import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async signup(signupDto: SignupDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: signupDto.email },
    });

    if (existingUser) {
      throw new BadRequestException('Email already exists');
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

    return this.generateToken(user.id, user.email);
  }

  async login(loginDto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatches = await bcrypt.compare(loginDto.password, user.password);

    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateToken(user.id, user.email);
  }

  private generateToken(userId: number, email: string) {
    const payload = { sub: userId, email };
    return { access_token: this.jwtService.sign(payload) };
  }
}*/

/*import { Injectable, BadRequestException, UnauthorizedException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

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

      const token = this.generateToken(user.id, user.email);
      
      return {
        success: true,
        message: 'User registered successfully',
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
        error: error.message,
      });
    }
  }

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
        error: error.message,
      });
    }
  }

  private generateToken(userId: number, email: string) {
    const payload = { sub: userId, email };
    return { access_token: this.jwtService.sign(payload) };
  }
}*/

import { Injectable, BadRequestException, UnauthorizedException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

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

      const token = this.generateToken(user.id, user.email);
      
      return {
        success: true,
        message: 'User registered successfully',
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

  private generateToken(userId: number, email: string) {
    const payload = { sub: userId, email };
    return { access_token: this.jwtService.sign(payload) };
  }
}