import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { JobProgress } from './job-progress.enum';

export class PrintSoonStatusDto {
  @IsEnum(JobProgress)
  @ApiProperty({
    description: 'The current progress of the printing procedure.',
  })
  progress: JobProgress = null;
}
