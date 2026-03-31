import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { PaginationService } from 'src/common/services/pagination.service';
import { AuditLoggerService } from 'src/common/services/audit-logger.service';
import { UserRole } from '@prisma/client';
import { ForbiddenException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              update: jest.fn(),
            },
          },
        },
        {
          provide: PaginationService,
          useValue: {},
        },
        {
          provide: AuditLoggerService,
          useValue: { logUpdate: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('update', () => {
    it('should throw ForbiddenException when AGENCY_ADMIN tries to promote user to SUPER_ADMIN', async () => {
      // Mock calling user as AGENCY_ADMIN
      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce({
        id: 'agency-admin-123',
        role: UserRole.AGENCY_ADMIN,
      });

      const updateDto = { role: UserRole.SUPER_ADMIN };

      await expect(
        service.update('target-user-456', updateDto as any, 'agency-admin-123'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should allow SUPER_ADMIN to promote user to SUPER_ADMIN', async () => {
      // Mock calling user as SUPER_ADMIN
      (prisma.user.findUnique as jest.Mock)
        .mockResolvedValueOnce({
          id: 'super-admin-123',
          role: UserRole.SUPER_ADMIN,
        })
        .mockResolvedValueOnce({
          id: 'target-user-456',
          role: UserRole.INSPECTOR,
        }); // Mock target user fetch

      (prisma.user.update as jest.Mock).mockResolvedValueOnce({});

      const updateDto = { role: UserRole.SUPER_ADMIN };

      await expect(
        service.update('target-user-456', updateDto as any, 'super-admin-123'),
      ).resolves.toBeDefined();
    });
  });
});
