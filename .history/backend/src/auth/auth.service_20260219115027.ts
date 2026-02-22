import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoginDto, SuperAdminSignupDto } from './dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Language } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}
  async superAdminSingup(dto: SuperAdminSignupDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existingUser) {
      throw new ConflictException('Email Already Exists!');
    }
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const newUser = await this.prisma.user.create({
      data: {
        fullName: dto.fullName,
        email: dto.email,
        
        passwordHash: hashedPassword,
        role: dto.role,
        language: dto.language,
        isActive: dto.isActive,
      },
      select: {
        fullName: true,
        email: true,
        role: true,
        language: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return newUser;
    
  }

  async login(dto: LoginDto) {
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

    const token = await this.jwt.signAsync(
      {
        sub: user.id, // user id
        email: user.email,
        role: user.role, // ← role is inside token!
      },
      {
        expiresIn: '7d',
        secret: process.env.JWT_SECRET,
      },
    );
    return {
      accessToken: token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        language: user.language,
      },
    };
  }
}
