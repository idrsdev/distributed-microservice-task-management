import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateTaskDto {
  @ApiProperty({ description: 'The title of the task' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ description: 'The description of the task (optional)' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'The ID of the user who created the task' })
  @IsNotEmpty()
  @IsString()
  createdBy: string;
}

export class UpdateTaskDto {
  @ApiProperty({ description: 'The updated title of the task (optional)' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ description: 'The updated status of the task (optional)' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({
    description: 'The updated description of the task (optional)',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'The ID of the user to whom the task is assigned (optional)',
  })
  @IsOptional()
  @IsString()
  assignedTo?: string;

  @ApiProperty({
    description: 'The ID of the user who updated the task (optional)',
  })
  @IsOptional()
  @IsString()
  updatedBy?: string;
}
