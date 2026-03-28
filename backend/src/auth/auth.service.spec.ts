import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwt },
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
});