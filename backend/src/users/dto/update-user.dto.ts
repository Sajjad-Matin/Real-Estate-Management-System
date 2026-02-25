import { Language, UserRole } from '@prisma/client';
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  ValidateIf,
} from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  fullName?: string;

  @IsEnum(Language)
  @IsOptional()
  language?: Language;

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ValidateIf((o) => o.role === UserRole.AGENCY_ADMIN)
  @IsUUID()
  @IsOptional()
  agencyId?: string;
}