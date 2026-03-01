import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateTransactionDto } from './create-transaction.dto';

// Can only update buyer/seller details, not property or agency
export class UpdateTransactionDto extends PartialType(
  OmitType(CreateTransactionDto, ['propertyId', 'agencyId'] as const),
) {}