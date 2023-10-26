import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { PrintDto } from './print.dto';

export class PrintUrlOptionalDto extends PrintDto {
  @ApiProperty({
    description: 'Url of the page to be printed.',
    required: false,
  })
  url?: string;
  @Transform(({ value }) => value === 'true')
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Cleanup job data.',
    default: true,
  })
  cleanupJob: boolean = true;
}
