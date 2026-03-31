import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  ForgotPasswordDto,
  LoginDto,
  RefreshTokenDto,
  ResetPasswordDto,
} from './dto';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { ChangePasswordDto } from './dto/change-password.dto';
import { EmailService } from 'src/common/services/email.service';
import { AuditAction, AuditService } from 'src/common/services/audit.service';
import { AuditLoggerService } from 'src/common/services/audit-logger.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private emailService: EmailService,
    private auditService: AuditService,
    private auditLogService: AuditLoggerService,
  ) {}

  // ✅ Password validation helper
  private validatePassword(password: string) {
    if (password.length < 6) {
      throw new BadRequestException('Password must be at least 6 characters');
    }
    if (!/[A-Za-z]/.test(password)) {
      throw new BadRequestException('Password must contain a letter');
    }
    if (!/[0-9]/.test(password)) {
      throw new BadRequestException('Password must contain a number');
    }
  }

  async login(dto: LoginDto, ipAddress?: string, userAgent?: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
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
        agencyId: user.agencyId,
      },
      {
        expiresIn: '15m',
        secret: process.env.JWT_SECRET || 'fallback-secret',
      },
    );

    const refreshToken = await this.jwt.signAsync(
      {
        sub: user.id,
        type: 'refresh',
      },
      {
        expiresIn: '7d',
        secret:
          process.env.JWT_REFRESH_SECRET ||
          process.env.JWT_SECRET ||
          'fallback-refresh-secret',
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

    await this.auditLogService.logLogin(user.id, ipAddress, userAgent);

    return {
      message: 'Login successful',
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        agencyId: user.agencyId,
      },
    };
  }

  async refreshToken(dto: RefreshTokenDto) {
    const session = await this.prisma.session.findUnique({
      where: { refreshToken: dto.refreshToken },
      include: { user: true },
    });

    if (!session || !session.user.isActive) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (new Date() > session.expiresAt) {
      await this.prisma.session.delete({
        where: { id: session.id },
      });
      throw new UnauthorizedException('Refresh token expired');
    }

    try {
      await this.jwt.verifyAsync(dto.refreshToken, {
        secret:
          process.env.JWT_REFRESH_SECRET ||
          process.env.JWT_SECRET ||
          'fallback-refresh-secret',
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const accessToken = await this.jwt.signAsync(
      {
        sub: session.user.id,
        email: session.user.email,
        role: session.user.role,
        agencyId: session.user.agencyId,
      },
      {
        expiresIn: '15m',
        secret: process.env.JWT_SECRET || 'fallback-secret',
      },
    );

    return { accessToken };
  }

  async logout(
    userId: string,
    refreshToken: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const session = await this.prisma.session.findFirst({
      where: { userId, refreshToken },
    });

    if (session) {
      await this.prisma.session.delete({
        where: { id: session.id },
      });
    }

    await this.auditLogService.logLogout(userId, ipAddress, userAgent);

    return { message: 'Logged out successfully' };
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) throw new NotFoundException('User not found');

    const passwordMatches = await bcrypt.compare(
      dto.currentPassword,
      user.passwordHash,
    );

    if (!passwordMatches) {
      throw new BadRequestException('Current password is incorrect');
    }

    this.validatePassword(dto.newPassword);

    const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;
    const hashedPassword = await bcrypt.hash(dto.newPassword, saltRounds);

    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: hashedPassword },
    });

    await this.prisma.session.deleteMany({
      where: { userId },
    });

    return { message: 'Password changed successfully. Please login again.' };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      return {
        message: 'If that email exists, we sent a password reset link',
      };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    await this.prisma.passwordReset.create({
      data: {
        userId: user.id,
        token: resetToken,
        expiresAt,
      },
    });

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;

    if (process.env.NODE_ENV !== 'test') {
      try {
        await this.emailService.sendPasswordReset(user.email, resetLink);
      } catch {
        throw new BadRequestException('Failed to send reset email');
      }
    }

    return {
      message: 'If that email exists, we sent a password reset link',
      ...(process.env.NODE_ENV !== 'production' && {
        devOnly_resetToken: resetToken,
      }),
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const passwordReset = await this.prisma.passwordReset.findUnique({
      where: { token: dto.token },
      include: { user: true },
    });

    if (!passwordReset) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    if (new Date() > passwordReset.expiresAt) {
      throw new BadRequestException('Reset token has expired');
    }

    if (passwordReset.used) {
      throw new BadRequestException('Reset token has already been used');
    }

    this.validatePassword(dto.newPassword);

    const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;
    const hashedPassword = await bcrypt.hash(dto.newPassword, saltRounds);

    await this.prisma.user.update({
      where: { id: passwordReset.userId },
      data: { passwordHash: hashedPassword },
    });

    await this.prisma.passwordReset.update({
      where: { id: passwordReset.id },
      data: { used: true },
    });

    await this.prisma.session.deleteMany({
      where: { userId: passwordReset.userId },
    });

    return {
      message:
        'Password reset successfully. Please login with your new password.',
    };
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }
}