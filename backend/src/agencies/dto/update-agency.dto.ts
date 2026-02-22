import { PartialType } from '@nestjs/mapped-types';
import { CreateAgencyDto } from './create-agency.dto';

export class UpdateAgencyDto extends PartialType(CreateAgencyDto) {}
