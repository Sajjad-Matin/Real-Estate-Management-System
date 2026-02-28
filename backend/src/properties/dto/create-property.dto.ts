import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreatePropertyDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  region: string;

  @IsString()
  @IsOptional()
  cadastralNo?: string; // Optional, unique cadastral number

  @IsUUID()
  @IsNotEmpty()
  agencyId: string; // Required for SUPER_ADMIN, auto-filled for AGENCY_ADMIN
}