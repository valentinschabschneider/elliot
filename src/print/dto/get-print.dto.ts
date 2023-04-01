import { ApiProperty } from '@nestjs/swagger';
import { PrintDto } from './print.dto';

export class GetPrintDto extends PrintDto {
  @ApiProperty({ description: 'Url of the page to be printed.' })
  url: string;
}
