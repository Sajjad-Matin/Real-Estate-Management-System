import { IsOptional, IsString, IsDateString } from 'class-validator';
import { SearchDto } from 'src/common/dto/search.dto';

export class SearchAuditLogDto extends SearchDto {
  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  action?: string;

  @IsOptional()
  @IsString()
  entity?: string;

  @IsOptional()
  @IsString()
  entityId?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}