import { ApiProperty } from '@nestjs/swagger';
import { PrintUrlOptionalDto } from './print-url-optional.dto';

export class PrintUrlRequiredDto extends PrintUrlOptionalDto {
  @ApiProperty({
    required: true,
  })
  url: string;
}
