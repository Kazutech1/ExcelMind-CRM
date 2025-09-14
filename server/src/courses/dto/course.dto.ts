import { 
  IsString, 
  IsNotEmpty, 
  IsInt, 
  Min, 
  Max, 
  IsOptional, 
  IsUUID,
  IsEnum 
} from 'class-validator';
import { EnrollmentStatus } from '@prisma/client';

export class CreateCourseDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsInt()
  @Min(1)
  @Max(10)
  credits: number;

  @IsString()
  @IsOptional()
  syllabus?: string;
}

export class UpdateCourseDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsInt()
  @Min(1)
  @Max(10)
  @IsOptional()
  credits?: number;

  @IsString()
  @IsOptional()
  syllabus?: string;
}

export class AssignLecturerDto {
  @IsUUID()
  @IsNotEmpty()
  lecturerId: string;
}

export class UpdateEnrollmentDto {
  @IsEnum(EnrollmentStatus)
  status: EnrollmentStatus;
}

export class CourseQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  lecturerId?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  credits?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 10;
}