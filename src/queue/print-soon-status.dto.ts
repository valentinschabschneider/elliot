import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class PrintSoonStatusDto {
  // @IsEnum(JobProgress)
  @ApiProperty({
    description: 'The current progress of the printing procedure.',
  })
  state: string; //JobProgress
  @IsString()
  @ApiProperty({
    description: 'The error message if one occured.',
  })
  error?: string = null;
}
