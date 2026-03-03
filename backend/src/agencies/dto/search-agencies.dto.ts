import { IsOptional, IsEnum, IsString } from 'class-validator';
import { SearchDto } from 'src/common/dto/search.dto';
import { AgencyStatus } from '@prisma/client';

export class SearchAgenciesDto extends SearchDto {
  @IsOptional()
  @IsEnum(AgencyStatus)
  status?: AgencyStatus;

  @IsOptional()
  @IsString()
  region?: string;
}