import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class PrintSoonCreateDto {
  @IsString()
  @ApiProperty({
    description: 'The id of the print job.',
  })
  id: string;
}
