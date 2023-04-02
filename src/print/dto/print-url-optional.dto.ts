import { ApiProperty } from '@nestjs/swagger';
import { PrintDto } from './print.dto';

export class PrintUrlOptionalDto extends PrintDto {
  @ApiProperty({
    description: 'Url of the page to be printed.',
    required: false,
  })
  url?: string;
}
