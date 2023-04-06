import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional } from 'class-validator';

export class CollectDto {
  @Transform(({ value }) => value === 'true')
  @IsOptional()
  @ApiPropertyOptional({
    description: 'File will be downloaded. Otherwise streamed.',
    default: true,
  })
  download: boolean = true;
  @IsOptional()
  @ApiPropertyOptional({
    description: 'The file name when downloaded.',
  })
  fileName?: string;
}
