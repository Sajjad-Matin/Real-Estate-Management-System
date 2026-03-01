import { VerificationStatus } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class VerifyTransactionDto {
  @IsEnum(VerificationStatus)
  @IsNotEmpty()
  status: VerificationStatus; // APPROVED or REJECTED

  @IsString()
  @IsOptional()
  remarks?: string;
}