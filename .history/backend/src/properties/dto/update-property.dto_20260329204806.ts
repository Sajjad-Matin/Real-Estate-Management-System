import { PartialType } from '@nestjs/mapped-types';
import { CreatePropertyDto } from './create-property.dto';
import { OmitType } from '@nestjs/mapped-types';

// Exclude agencyId from updates for non-super-admins (handled in service)
export class UpdatePropertyDto extends PartialType(CreatePropertyDto) {}
