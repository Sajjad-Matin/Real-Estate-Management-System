import { Test, TestingModule } from '@nestjs/testing';
import { PropertiesService } from './properties.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { PaginationService } from 'src/common/services/pagination.service';
import { UserRole } from '@prisma/client';
import { ForbiddenException } from '@nestjs/common';

describe('PropertiesService', () => {
  let service: PropertiesService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PropertiesService,
        {
          provide: PrismaService,
          useValue: {
            property: {
              findUnique: jest.fn(),
              update: jest.fn(),
            },
          },
        },
        {
          provide: PaginationService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<PropertiesService>(PropertiesService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('update', () => {
    it('should strip agencyId if AGENCY_ADMIN tries to update property', async () => {
      const mockProperty = { id: 'prop-1', agencyId: 'agency-A' };
      (prisma.property.findUnique as jest.Mock).mockResolvedValueOnce(
        mockProperty,
      );

      const updateDto = { title: 'New Title', agencyId: 'agency-B' };
      const currentUser = {
        id: 'user-1',
        role: UserRole.AGENCY_ADMIN,
        agencyId: 'agency-A',
      };

      await service.update('prop-1', updateDto as any, currentUser as any);

      // Verify agencyId wrapper stripped properly
      expect(prisma.property.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.not.objectContaining({ agencyId: expect.anything() }),
        }),
      );
    });

    it('should allow SUPER_ADMIN to update agencyId of a property', async () => {
      const mockProperty = { id: 'prop-1', agencyId: 'agency-A' };
      (prisma.property.findUnique as jest.Mock).mockResolvedValueOnce(
        mockProperty,
      );

      const updateDto = { agencyId: 'agency-B' };
      const currentUser = {
        id: 'user-1',
        role: UserRole.SUPER_ADMIN,
        agencyId: null,
      };

      await service.update('prop-1', updateDto as any, currentUser as any);

      // Verify agencyId is allowed
      expect(prisma.property.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ agencyId: 'agency-B' }),
        }),
      );
    });
  });
});
