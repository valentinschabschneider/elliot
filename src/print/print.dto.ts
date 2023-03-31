import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { PayloadDto } from 'src/common/payload.dto';

export class PrintDto extends PayloadDto {
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
    default: 'document.pdf',
  })
  fileName?: string = 'document.pdf';
}
