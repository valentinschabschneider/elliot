import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { PrintUrlOptionalDto } from './print-url-optional.dto';

export class PrintUrlCollectOptionalDto extends PrintUrlOptionalDto {
  @Transform(({ value }) => value === 'true')
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Cleanup job data.',
    default: false,
  })
  cleanupJob: boolean = false;
}
