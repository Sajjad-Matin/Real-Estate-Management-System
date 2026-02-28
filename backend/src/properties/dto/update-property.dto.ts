import { PartialType } from '@nestjs/mapped-types';
import { CreatePropertyDto } from './create-property.dto';
import { OmitType } from '@nestjs/mapped-types';

// Exclude agencyId from updates
export class UpdatePropertyDto extends PartialType(
  OmitType(CreatePropertyDto, ['agencyId'] as const),
) {}