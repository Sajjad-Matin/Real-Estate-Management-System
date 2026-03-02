import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateUserDto,
  ForgotPasswordDto,
  LoginDto,
  RefreshTokenDto,
  ResetPasswordDto,
} from './dto';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '@prisma/client';
import { ChangePasswordDto } from './dto/change-password.dto';
import { EmailService } from 'src/common/services/email.service';
import { AuditAction, AuditService } from 'src/common/services/audit.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private emailService: EmailService,
    private auditService: AuditService,
  ) {}
  async createUser(dto: CreateUserDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existingUser) {
      throw new ConflictException('Email Already Exists!');
    }

    if (dto.role === UserRole.AGENCY_ADMIN && dto.agencyId) {
      const agency = await this.prisma.agency.findUnique({
        where: { id: dto.agencyId },
      });
      if (!agency) {
        throw new NotFoundException('Agency not found');
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Create user
    const newUser = await this.prisma.user.create({
      data: {
        fullName: dto.fullName,
        email: dto.email,
        passwordHash: hashedPassword,
        role: dto.role,
        language: dto.language,
        isActive: dto.isActive ?? true,
        agencyId: dto.agencyId,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        language: true,
        isActive: true,
        agencyId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return newUser;
  }
  async login(dto: LoginDto, ipAddress?: string, userAgent?: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is disabled');
    }

    const passwordMatches = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const accessToken = await this.jwt.signAsync(
      {
        sub: user.id,
        email: user.email,
        role: user.role,
      },
      {
        expiresIn: '15m',
        secret: process.env.JWT_SECRET,
      },
    );

    const refreshToken = await this.jwt.signAsync(
      {
        sub: user.id,
        type: 'refresh',
      },
      {
        expiresIn: '7d',
        secret: process.env.JWT_REFRESH_SECRET,
      },
    );

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.prisma.session.create({
      data: {
        userId: user.id,
        refreshToken,
        expiresAt,
      },
    });

    await this.auditService.log({
      userId: user.id,
      action: AuditAction.LOGIN,
      entity: 'User',
      entityId: user.id,
      ipAddress,
      userAgent,
    });

    return {
      accessToken: accessToken,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        language: user.language,
      },
    };
  }

  async refreshToken(dto: RefreshTokenDto) {
    // Find session with this refresh token
    const session = await this.prisma.session.findUnique({
      where: { refreshToken: dto.refreshToken },
      include: { user: true },
    });

    if (!session) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Check if token expired
    if (new Date() > session.expiresAt) {
      // Delete expired session
      await this.prisma.session.delete({
        where: { id: session.id },
      });
      throw new UnauthorizedException('Refresh token expired');
    }

    // Check if user is still active
    if (!session.user.isActive) {
      throw new UnauthorizedException('Account is disabled');
    }

    // Verify the refresh token
    try {
      await this.jwt.verifyAsync(dto.refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Generate new access token
    const accessToken = await this.jwt.signAsync(
      {
        sub: session.user.id,
        email: session.user.email,
        role: session.user.role,
      },
      {
        expiresIn: '15m',
        secret: process.env.JWT_SECRET,
      },
    );

    return {
      accessToken,
    };
  }

  async logout(userId: string, refreshToken: string) {
    const session = await this.prisma.session.findFirst({
      where: {
        userId,
        refreshToken,
      },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    await this.prisma.session.delete({
      where: { id: session.id },
    });

    return { message: 'Logged out successfully' };
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify current password
    const passwordMatches = await bcrypt.compare(
      dto.currentPassword,
      user.passwordHash,
    );

    if (!passwordMatches) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Check if new password is same as old
    const sameAsOld = await bcrypt.compare(dto.newPassword, user.passwordHash);
    if (sameAsOld) {
      throw new BadRequestException(
        'New password must be different from current password',
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

    // Update password
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: hashedPassword },
    });

    // Invalidate all sessions (force re-login)
    await this.prisma.session.deleteMany({
      where: { userId },
    });

    return { message: 'Password changed successfully. Please login again.' };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    // Don't reveal if email exists (security best practice)
    if (!user) {
      return {
        message: 'If that email exists, we sent a password reset link',
      };
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    // Save to database
    await this.prisma.passwordReset.create({
      data: {
        userId: user.id,
        token: resetToken,
        expiresAt,
      },
    });

    // Build reset link
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;

    // Send email in production
    if (process.env.NODE_ENV === 'production') {
      try {
        await this.emailService.sendPasswordReset(user.email, resetLink);
      } catch (error) {
        console.error('Failed to send password reset email:', error);
        // Don't throw error - we don't want to reveal if email failed
      }
    } else {
      // Development: log to console
      console.log('='.repeat(60));
      console.log('PASSWORD RESET REQUEST');
      console.log('='.repeat(60));
      console.log('Email:', user.email);
      console.log('Reset Link:', resetLink);
      console.log('Token:', resetToken);
      console.log('Expires:', expiresAt);
      console.log('='.repeat(60));
    }

    return {
      message: 'If that email exists, we sent a password reset link',
      // Only return token in development
      ...(process.env.NODE_ENV !== 'production' && {
        devOnly_resetToken: resetToken,
      }),
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    // Find reset token
    const passwordReset = await this.prisma.passwordReset.findUnique({
      where: { token: dto.token },
      include: { user: true },
    });

    if (!passwordReset) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    // Check if token expired
    if (new Date() > passwordReset.expiresAt) {
      throw new BadRequestException('Reset token has expired');
    }

    // Check if already used
    if (passwordReset.used) {
      throw new BadRequestException('Reset token has already been used');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

    // Update password
    await this.prisma.user.update({
      where: { id: passwordReset.userId },
      data: { passwordHash: hashedPassword },
    });

    // Mark token as used
    await this.prisma.passwordReset.update({
      where: { id: passwordReset.id },
      data: { used: true },
    });

    // Delete all sessions (force re-login)
    await this.prisma.session.deleteMany({
      where: { userId: passwordReset.userId },
    });

    return {
      message:
        'Password reset successfully. Please login with your new password.',
    };
  }
}
