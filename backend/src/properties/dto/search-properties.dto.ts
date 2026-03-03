import { IsOptional, IsString, IsUUID } from 'class-validator';
import { SearchDto } from 'src/common/dto/search.dto';

export class SearchPropertiesDto extends SearchDto {
  @IsOptional()
  @IsString()
  region?: string;

  @IsOptional()
  @IsUUID()
  agencyId?: string;
}