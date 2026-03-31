import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsService } from './transactions.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuditService } from 'src/common/services/audit.service';
import { PaginationService } from 'src/common/services/pagination.service';
import { UserRole, VerificationStatus } from '@prisma/client';
import { CurrentUser } from 'src/common/types';

describe('TransactionsService', () => {
  let service: TransactionsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        {
          provide: PrismaService,
          useValue: {
            tradeTransaction: {
              findMany: jest.fn(),
              count: jest.fn().mockResolvedValue(1),
            },
          },
        },
        {
          provide: AuditService,
          useValue: { log: jest.fn() },
        },
        {
          provide: PaginationService,
          useValue: {
            getSkip: jest.fn().mockReturnValue(0),
            paginate: jest.fn().mockReturnValue({ data: [], meta: {} }),
          },
        },
      ],
    }).compile();

    service = module.get<TransactionsService>(TransactionsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll filters', () => {
    it('should strictly filter by PENDING for INSPECTOR roles overriding status query', async () => {
      const mockUser: CurrentUser = {
        id: 'inspector-cmd',
        email: 'test@admin.com',
        role: UserRole.INSPECTOR,
        agencyId: null,
      };

      const searchDto = {
        page: 1,
        limit: 10,
        status: VerificationStatus.APPROVED, // Malicious / bypassing parameter
      };

      await service.findAll(mockUser, searchDto);

      // Verify that where clause forces PENDING status, ignoring the APPROVED filter
      expect(prisma.tradeTransaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: VerificationStatus.PENDING,
          }),
        }),
      );
    });
  });
});
