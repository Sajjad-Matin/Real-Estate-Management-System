import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import {
  CreateTransactionDto,
  UpdateTransactionDto,
  VerifyTransactionDto,
} from './dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CurrentUser } from 'src/common/types';
import { UserRole, VerificationStatus } from '@prisma/client';

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  async create(createTransactionDto: CreateTransactionDto, currentUser: CurrentUser) {
    // If AGENCY_ADMIN, use their agency
    if (currentUser.role === UserRole.AGENCY_ADMIN) {
      if (!currentUser.agencyId) {
        throw new ForbiddenException('You are not associated with any agency');
      }
      createTransactionDto.agencyId = currentUser.agencyId;
    }

    // Verify property exists
    const property = await this.prisma.property.findUnique({
      where: { id: createTransactionDto.propertyId },
    });

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    // If AGENCY_ADMIN, verify they own the property
    if (
      currentUser.role === UserRole.AGENCY_ADMIN &&
      property.agencyId !== currentUser.agencyId
    ) {
      throw new ForbiddenException(
        'You can only create transactions for your agency\'s properties',
      );
    }

    // Verify agency exists (for SUPER_ADMIN)
    if (currentUser.role === UserRole.SUPER_ADMIN) {
      const agency = await this.prisma.agency.findUnique({
        where: { id: createTransactionDto.agencyId },
      });

      if (!agency) {
        throw new NotFoundException('Agency not found');
      }
    }

    // Create transaction
    const transaction = await this.prisma.tradeTransaction.create({
      data: {
        ...createTransactionDto,
        status: VerificationStatus.PENDING, // Always starts as PENDING
      },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            address: true,
            cadastralNo: true,
          },
        },
        agency: {
          select: {
            id: true,
            name: true,
            licenseNumber: true,
          },
        },
      },
    });

    return {
      message: 'Trade transaction created successfully',
      transaction,
    };
  }

  async findAll(currentUser: CurrentUser, status?: VerificationStatus) {
    // Build where clause based on role
    const where: any = {};

    // Filter by status if provided
    if (status) {
      where.status = status;
    }

    // AGENCY_ADMIN only sees their agency's transactions
    if (currentUser.role === UserRole.AGENCY_ADMIN) {
      where.agencyId = currentUser.agencyId;
    }

    // INSPECTOR sees only PENDING transactions
    if (currentUser.role === UserRole.INSPECTOR) {
      where.status = VerificationStatus.PENDING;
    }

    return this.prisma.tradeTransaction.findMany({
      where,
      include: {
        property: {
          select: {
            id: true,
            title: true,
            address: true,
            region: true,
            cadastralNo: true,
          },
        },
        agency: {
          select: {
            id: true,
            name: true,
            licenseNumber: true,
          },
        },
        verifications: {
          select: {
            id: true,
            verifiedBy: true,
            status: true,
            remarks: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string, currentUser: CurrentUser) {
    const transaction = await this.prisma.tradeTransaction.findUnique({
      where: { id },
      include: {
        property: {
          include: {
            ownerships: true,
          },
        },
        agency: true,
        verifications: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    // AGENCY_ADMIN can only view their own transactions
    if (
      currentUser.role === UserRole.AGENCY_ADMIN &&
      transaction.agencyId !== currentUser.agencyId
    ) {
      throw new ForbiddenException(
        'You do not have permission to view this transaction',
      );
    }

    return transaction;
  }

  async update(
    id: string,
    updateTransactionDto: UpdateTransactionDto,
    currentUser: CurrentUser,
  ) {
    const transaction = await this.prisma.tradeTransaction.findUnique({
      where: { id },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    // Only the agency that created it can update
    if (
      currentUser.role === UserRole.AGENCY_ADMIN &&
      transaction.agencyId !== currentUser.agencyId
    ) {
      throw new ForbiddenException(
        'You do not have permission to update this transaction',
      );
    }

    // Cannot update if already verified
    if (transaction.status !== VerificationStatus.PENDING) {
      throw new BadRequestException(
        'Cannot update transaction that has been verified',
      );
    }

    const updatedTransaction = await this.prisma.tradeTransaction.update({
      where: { id },
      data: updateTransactionDto,
      include: {
        property: true,
        agency: true,
      },
    });

    return {
      message: 'Transaction updated successfully',
      transaction: updatedTransaction,
    };
  }

  async remove(id: string, currentUser: CurrentUser) {
    const transaction = await this.prisma.tradeTransaction.findUnique({
      where: { id },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    // Only SUPER_ADMIN can delete transactions
    if (currentUser.role !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException(
        'Only SUPER_ADMIN can delete transactions',
      );
    }

    await this.prisma.tradeTransaction.delete({
      where: { id },
    });

    return {
      message: 'Transaction deleted successfully',
    };
  }

  // Verify transaction (for INSPECTOR and SUPER_ADMIN)
  async verify(
    id: string,
    verifyDto: VerifyTransactionDto,
    currentUser: CurrentUser,
  ) {
    const transaction = await this.prisma.tradeTransaction.findUnique({
      where: { id },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    // Only INSPECTOR and SUPER_ADMIN can verify
    if (
      currentUser.role !== UserRole.INSPECTOR &&
      currentUser.role !== UserRole.SUPER_ADMIN
    ) {
      throw new ForbiddenException(
        'Only INSPECTOR or SUPER_ADMIN can verify transactions',
      );
    }

    // Cannot verify if already verified
    if (transaction.status !== VerificationStatus.PENDING) {
      throw new BadRequestException('Transaction has already been verified');
    }

    // Create verification record
    await this.prisma.tradeVerification.create({
      data: {
        tradeId: id,
        verifiedBy: currentUser.id,
        status: verifyDto.status,
        remarks: verifyDto.remarks,
      },
    });

    // Update transaction status
    const updatedTransaction = await this.prisma.tradeTransaction.update({
      where: { id },
      data: {
        status: verifyDto.status,
      },
      include: {
        property: true,
        agency: true,
        verifications: true,
      },
    });

    return {
      message: `Transaction ${verifyDto.status.toLowerCase()} successfully`,
      transaction: updatedTransaction,
    };
  }

  // Get pending transactions (for INSPECTOR)
  async findPending() {
    return this.prisma.tradeTransaction.findMany({
      where: {
        status: VerificationStatus.PENDING,
      },
      include: {
        property: {
          select: {
            title: true,
            address: true,
            region: true,
            cadastralNo: true,
          },
        },
        agency: {
          select: {
            name: true,
            licenseNumber: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc', // Oldest first
      },
    });
  }

  // Get transactions by property
  async findByProperty(propertyId: string) {
    return this.prisma.tradeTransaction.findMany({
      where: { propertyId },
      include: {
        agency: {
          select: {
            name: true,
          },
        },
        verifications: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}