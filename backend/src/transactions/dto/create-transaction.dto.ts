import { TradeType } from '@prisma/client';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateTransactionDto {
  @IsUUID()
  @IsNotEmpty()
  propertyId: string;

  @IsUUID()
  @IsNotEmpty()
  agencyId: string; // Auto-filled for AGENCY_ADMIN

  @IsEnum(TradeType)
  @IsNotEmpty()
  tradeType: TradeType; // SALE, RENT, TRANSFER

  @IsNumber()
  @IsPositive()
  price: number;

  @IsString()
  @IsNotEmpty()
  buyerName: string;

  @IsString()
  @IsOptional()
  buyerIdNo?: string;

  @IsString()
  @IsNotEmpty()
  sellerName: string;

  @IsString()
  @IsOptional()
  sellerIdNo?: string;
}