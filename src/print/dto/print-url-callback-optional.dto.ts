import { ApiProperty } from '@nestjs/swagger';
import { PrintUrlOptionalDto } from './print-url-optional.dto';

export class PrintUrlCallbackOptionalDto extends PrintUrlOptionalDto {
  @ApiProperty({
    description: 'Url of the callback endpoint that should be called.',
    required: false,
  })
  callbackUrl?: string;
}
