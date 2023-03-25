import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';
import { IsArray, IsOptional, IsPositive } from 'class-validator';

export class PrintDto {
  @ApiProperty({ description: 'Url of the page to be printed.' })
  url: string;
  @Transform(({ value }) => value === 'true')
  @IsOptional()
  @ApiPropertyOptional({
    description: 'File will be downloaded. Otherwise streamed.',
    default: true,
  })
  download: boolean = true;
  @IsArray()
  @Transform(({ value }) =>
    Array.isArray(value) ? value : value === undefined ? [] : [value],
  )
  @IsOptional()
  @Expose({ name: 'additionalScript' })
  @ApiPropertyOptional({
    description: 'Additional scripts to load.',
    default: [],
  })
  additionalScripts?: string[];
  @Type(() => Number)
  @IsOptional()
  @IsPositive()
  @ApiPropertyOptional({
    description: 'Timeout in milliseconds.',
    default: undefined,
  })
  timeout?: number;
  @IsOptional()
  @ApiPropertyOptional({
    description: 'The file name when downloaded.',
    default: 'file.pdf',
  })
  fileName?: string = 'file.pdf';
}
