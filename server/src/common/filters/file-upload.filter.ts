import { BadRequestException } from '@nestjs/common';
import { Request } from 'express';
import * as path from 'path';
import * as fs from 'fs';

// File filter for multer
export const syllabusFileFilter = (
  req: Request,
  file: Express.Multer.File,
  callback: (error: Error | null, acceptFile: boolean) => void,
) => {
  // Allowed MIME types for PDF and DOCX
  const allowedMimeTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword', // For older .doc files
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    callback(null, true);
  } else {
    callback(
      new BadRequestException(
        'Invalid file type. Only PDF, DOC, and DOCX files are allowed.',
      ),
      false,
    );
  }
};

// Generate unique filename
export const generateFileName = (file: Express.Multer.File): string => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = path.extname(file.originalname);
  return `syllabus_${timestamp}_${randomString}${extension}`;
};

// File size limit (5MB)
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

// Ensure upload directory exists
export const ensureUploadDirectory = (uploadPath: string): void => {
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }
};

// Validate file size
export const validateFileSize = (file: Express.Multer.File): void => {
  if (file.size > MAX_FILE_SIZE) {
    throw new BadRequestException(
      `File size too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
    );
  }
};

// Delete file utility
export const deleteFile = (filePath: string): boolean => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};

// Get file extension from MIME type
export const getFileExtension = (mimeType: string): string => {
  const mimeToExt: { [key: string]: string } = {
    'application/pdf': '.pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
    'application/msword': '.doc',
  };
  
  return mimeToExt[mimeType] || '';
};