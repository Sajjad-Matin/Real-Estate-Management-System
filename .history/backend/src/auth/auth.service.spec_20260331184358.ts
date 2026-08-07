import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
// import { EmailService } from '../email/email.service';
// Update the import path below if the actual file location is different
// Example: import { EmailService } from 'src/email/email.service';
// Update the import path below if the actual file location is different
import { EmailService } from 'src/common/services/email.service';
import { AuditService } from 'src/common/services/audit.service';
// import { AuditService } from '../audit/audit.service';
// import { AuditService } from 'src/audit/audit.service';
// Update the import path below to the correct relative path if needed
// Example: import { AuditService } from '../audit/audit.service';
// import { AuditLoggerService } from 'src/audit/audit-logger.service';

describe('AuthService', () => {
  let service: AuthService;

  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
    },
    session: {
      create: jest.fn(),
    },
  };

  const mockJwt = {
    signAsync: jest.fn().mockResolvedValue('mock-token'),
  };

  const mockEmailService = { sendPasswordReset: jest.fn() };
  const mockAuditService = {};
  const mockAuditLoggerService = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwt },
        { provide: EmailService, useValue: mockEmailService },
        { provide: AuditService, useValue: mockAuditService },
        // { provide: AuditLoggerService, useValue: mockAuditLoggerService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should throw if user not found', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);

    await expect(
      service.login({ email: 'test@test.com', password: '123456' }),
    ).rejects.toThrow();
  });

  it('should login successfully', async () => {
    const mockUser = {
      id: '1',
      email: 'test@test.com',
      passwordHash: await bcrypt.hash('123456', 10),
      isActive: true,
      role: 'SUPER_ADMIN',
      agencyId: null,
    };

    mockPrisma.user.findUnique.mockResolvedValue(mockUser);

    const result = await service.login({
      email: 'test@test.com',
      password: '123456',
    });

    expect(result.accessToken).toBeDefined();
  });

  it('should send password reset email', async () => {
    const mockUser = {
      id: '1',
      email: 'test@test.com',
      passwordHash: await bcrypt.hash('123456', 10),
      isActive: true,
      role: 'SUPER_ADMIN',
      agencyId: null,
    };

    mockPrisma.user.findUnique.mockResolvedValue(mockUser);

    await service.sendPasswordReset('test@test.com');

    expect(mockEmailService.sendPasswordReset).toHaveBeenCalledWith(
      'test@test.com',
      expect.anything(),
    );
  });
});
