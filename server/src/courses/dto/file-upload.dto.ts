import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UploadSyllabusDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}

export interface FileUploadResponse {
  success: boolean;
  message: string;
  filePath?: string;
  originalName?: string;
  size?: number;
  mimeType?: string;
}