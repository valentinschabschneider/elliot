import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';
import { IsArray, IsOptional, IsPositive } from 'class-validator';

export class PayloadDto {
  @ApiProperty({ description: 'Url of the page to be printed.' })
  url: string;
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
  @Transform(({ value }) => value === 'true')
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Inject the polyfill script.',
    default: true,
  })
  injectPolyfill: boolean = true;
}
