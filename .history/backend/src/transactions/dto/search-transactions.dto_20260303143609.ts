import { IsOptional, IsEnum, IsUUID } from 'class-validator';
import { SearchDto } from 'src/common/dto/search.dto';
import { VerificationStatus, TradeType } from '@prisma/client';

export class SearchTransactionsDto extends SearchDto {
  @IsOptional()
  @IsEnum(VerificationStatus)
  status?: VerificationStatus;

  @IsOptional()
  @IsEnum(TradeType)
  tradeType?: TradeType;

  @IsOptional()
  @IsUUID()
  propertyId?: string;

  @IsOptional()
  @IsUUID()
  agencyId?: string;
}