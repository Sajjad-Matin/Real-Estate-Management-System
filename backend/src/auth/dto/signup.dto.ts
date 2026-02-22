import { Language, UserRole } from '@prisma/client';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsStrongPassword,
  IsUUID,
  ValidateIf,
} from 'class-validator';
import { IsRequiredIf } from 'src/common/validators/is-required-if.validator';

export class CreateUserDto {  // Rename from SuperAdminSignupDto
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsStrongPassword(
    {
      minLength: 6,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 0,
    },
    {
      message:
        'Password is too weak. It must be at least 6 characters long and include one uppercase letter, one lowercase letter, and one number.',
    },
  )
  @IsNotEmpty()
  password: string;

  @IsEnum(UserRole)
  role: UserRole;

  @IsEnum(Language)
  language: Language;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ValidateIf((o) => o.role === UserRole.AGENCY_ADMIN)
  @IsUUID()
  agencyId?: string;
}