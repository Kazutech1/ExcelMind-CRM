import { IsString, IsNotEmpty, IsOptional, IsNumber, Min, Max, IsEnum, IsUUID, IsDateString } from 'class-validator';
import { Transform } from 'class-transformer';
import { AssignmentType } from '@prisma/client';

export class CreateAssignmentDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(AssignmentType)
  type: AssignmentType;

  @IsNumber()
  @Min(0)
  @Max(100)
  @Transform(({ value }) => parseInt(value))
  weight: number; // Weight for grade calculation (0-100)

  @IsDateString()
  dueDate: string;

  @IsString()
  @IsUUID()
  courseId: string;
}

export class UpdateAssignmentDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(AssignmentType)
  @IsOptional()
  type?: AssignmentType;

  @IsNumber()
  @Min(0)
  @Max(100)
  @Transform(({ value }) => parseInt(value))
  @IsOptional()
  weight?: number;

  @IsDateString()
  @IsOptional()
  dueDate?: string;
}

export class SubmitAssignmentDto {
  @IsString()
  @IsOptional()
  textSubmission?: string;

  @IsString()
  @IsOptional()
  notes?: string; // Optional notes from student
}

export class GradeAssignmentDto {
  @IsNumber()
  @Min(0)
  @Max(100)
  @Transform(({ value }) => parseFloat(value))
  grade: number;

  @IsString()
  @IsOptional()
  feedback?: string; // Feedback from lecturer
}

export class AssignmentQueryDto {
  @IsString()
  @IsOptional()
  courseId?: string;

  @IsEnum(AssignmentType)
  @IsOptional()
  type?: AssignmentType;

  @IsString()
  @IsOptional()
  search?: string;

  @IsNumber()
  @Min(1)
  @Transform(({ value }) => parseInt(value))
  @IsOptional()
  page?: number = 1;

  @IsNumber()
  @Min(1)
  @Max(100)
  @Transform(({ value }) => parseInt(value))
  @IsOptional()
  limit?: number = 20;
}