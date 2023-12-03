import { ApiProperty } from '@nestjs/swagger';
import { PrintDto } from './print.dto';

export class PrintUrlCallbackOptionalDto extends PrintDto {
  @ApiProperty({
    description: 'Url of the callback endpoint that should be called.',
    required: false,
  })
  callbackUrl?: string;
}
